import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from db.models import Variant, Site, ExperimentStats
from schemas.variants import VariantCreate, VariantUpdate, VariantResponse, VariantDiff

router = APIRouter(tags=["variants"])


def variant_to_response(variant: Variant) -> VariantResponse:
    # Calculate conversion rate
    visitors = variant.stats.visitors if variant.stats else 0
    conversions = variant.stats.conversions if variant.stats else 0
    conversion_rate = (conversions / visitors * 100) if visitors > 0 else 0

    return VariantResponse(
        id=str(variant.id),
        site_id=str(variant.site_id),
        parent_variant_id=str(variant.parent_variant_id) if variant.parent_variant_id else None,
        patch=variant.patch or {},
        screenshot_url=variant.screenshot_url,
        generation_reasoning=variant.generation_reasoning,
        status=variant.status,
        created_at=variant.created_at,
        killed_at=variant.killed_at,
        stats={
            "visitors": variant.stats.visitors if variant.stats else 0,
            "conversions": variant.stats.conversions if variant.stats else 0,
            "conversion_rate": conversion_rate,
            "prob_best": variant.stats.prob_best if variant.stats else 0.0,
        }
    )


@router.get("/api/sites/{site_id}/variants", response_model=List[VariantResponse])
async def list_variants(site_id: str, db: Session = Depends(get_db)):
    variants = db.query(Variant).filter(Variant.site_id == uuid.UUID(site_id)).all()
    return [variant_to_response(v) for v in variants]


@router.post("/api/variants", response_model=VariantResponse)
async def create_variant(request: VariantCreate, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == uuid.UUID(request.site_id)).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    has_active = (
        db.query(Variant)
        .filter(Variant.site_id == uuid.UUID(request.site_id))
        .filter(Variant.status == "active")
        .first()
        is not None
    )

    status = request.status
    if status is None:
        status = "pending_review" if has_active else "active"

    variant = Variant(
        id=uuid.uuid4(),
        site_id=uuid.UUID(request.site_id),
        parent_variant_id=uuid.UUID(request.parent_variant_id) if request.parent_variant_id else None,
        patch=request.patch or {},
        generation_reasoning=request.generation_reasoning,
        status=status,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)

    stats = db.query(ExperimentStats).filter(ExperimentStats.variant_id == variant.id).first()
    if not stats:
        db.add(
            ExperimentStats(
                variant_id=variant.id,
                visitors=0,
                conversions=0,
                alpha=1.0,
                beta=1.0,
                prob_best=0.0,
            )
        )
        db.commit()

    return variant_to_response(variant)


@router.patch("/api/variants/{variant_id}", response_model=VariantResponse)
async def update_variant(variant_id: str, request: VariantUpdate, db: Session = Depends(get_db)):
    variant = db.query(Variant).filter(Variant.id == uuid.UUID(variant_id)).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    if request.status:
        variant.status = request.status
        if request.status == "killed":
            variant.killed_at = datetime.utcnow()

    db.commit()
    db.refresh(variant)
    return variant_to_response(variant)


@router.get("/api/variants/{variant_a}/diff/{variant_b}", response_model=VariantDiff)
async def get_variant_diff(variant_a: str, variant_b: str, db: Session = Depends(get_db)):
    v_a = db.query(Variant).filter(Variant.id == uuid.UUID(variant_a)).first()
    v_b = db.query(Variant).filter(Variant.id == uuid.UUID(variant_b)).first()

    if not v_a or not v_b:
        raise HTTPException(status_code=404, detail="Variant not found")

    patch_a = v_a.patch or {}
    patch_b = v_b.patch or {}

    changes = {}
    all_keys = set(patch_a.keys()) | set(patch_b.keys())

    for key in all_keys:
        val_a = patch_a.get(key)
        val_b = patch_b.get(key)
        if val_a != val_b:
            changes[key] = {"from": val_a, "to": val_b}

    return VariantDiff(
        variant_a=variant_a,
        variant_b=variant_b,
        changes=changes,
    )
