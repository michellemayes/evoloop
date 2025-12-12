import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from db import get_db
from db.models import Site, Variant, ExperimentStats, Event
from services.thompson_sampling import ThompsonSampler

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/site/{site_id}")
async def get_site_stats(site_id: str, db: Session = Depends(get_db)):
    """Get statistics for all variants of a site."""
    variants = (
        db.query(Variant, ExperimentStats)
        .join(ExperimentStats, Variant.id == ExperimentStats.variant_id, isouter=True)
        .filter(Variant.site_id == uuid.UUID(site_id))
        .filter(Variant.status.in_(["active", "pending_review"]))
        .all()
    )

    if not variants:
        raise HTTPException(status_code=404, detail="No variants found")

    # Calculate prob_best for active variants
    active_variants = [
        (str(v.id), s.alpha if s else 1.0, s.beta if s else 1.0)
        for v, s in variants
        if v.status == "active"
    ]
    prob_best = ThompsonSampler.calculate_prob_best(active_variants) if active_variants else {}

    result = []
    for variant, stats in variants:
        result.append({
            "variant_id": str(variant.id),
            "status": variant.status,
            "visitors": stats.visitors if stats else 0,
            "conversions": stats.conversions if stats else 0,
            "conversion_rate": (stats.conversions / stats.visitors * 100) if stats and stats.visitors > 0 else 0,
            "prob_best": prob_best.get(str(variant.id), 0),
            "patch": variant.patch or {},
        })

    return result


@router.post("/update/{site_id}")
async def update_site_stats(site_id: str, db: Session = Depends(get_db)):
    """Recalculate statistics for a site's variants from events."""
    variants = db.query(Variant).filter(
        Variant.site_id == uuid.UUID(site_id),
        Variant.status == "active"
    ).all()

    updated = []
    for variant in variants:
        # Count impressions and conversions
        impressions = db.query(func.count(Event.id)).filter(
            Event.variant_id == variant.id,
            Event.event_type == "impression"
        ).scalar()

        conversions = db.query(func.count(Event.id)).filter(
            Event.variant_id == variant.id,
            Event.event_type == "conversion"
        ).scalar()

        # Get or create stats
        stats = db.query(ExperimentStats).filter(
            ExperimentStats.variant_id == variant.id
        ).first()

        if not stats:
            stats = ExperimentStats(variant_id=variant.id)
            db.add(stats)

        stats.visitors = impressions
        stats.conversions = conversions
        stats.alpha = 1.0 + conversions
        stats.beta = 1.0 + (impressions - conversions)

        updated.append(str(variant.id))

    db.commit()

    # Recalculate prob_best
    variant_data = []
    for variant in variants:
        stats = db.query(ExperimentStats).filter(
            ExperimentStats.variant_id == variant.id
        ).first()
        if stats:
            variant_data.append((str(variant.id), stats.alpha, stats.beta))

    prob_best = ThompsonSampler.calculate_prob_best(variant_data)

    for variant_id, prob in prob_best.items():
        stats = db.query(ExperimentStats).filter(
            ExperimentStats.variant_id == uuid.UUID(variant_id)
        ).first()
        if stats:
            stats.prob_best = prob

    db.commit()

    return {"updated": updated, "prob_best": prob_best}


@router.post("/update-all")
async def update_all_stats(db: Session = Depends(get_db)):
    """Update statistics for all running sites."""
    sites = db.query(Site).filter(Site.status == "running").all()

    results = []
    for site in sites:
        try:
            result = await update_site_stats(str(site.id), db)
            results.append({"site_id": str(site.id), "status": "success", **result})
        except Exception as e:
            results.append({"site_id": str(site.id), "status": "error", "error": str(e)})

    return {"sites_updated": len(results), "results": results}
