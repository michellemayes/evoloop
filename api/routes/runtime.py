import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from db.models import Site, Variant, ExperimentStats, Event
from schemas.runtime import AssignResponse, EventRequest, EventResponse
from services.thompson_sampling import ThompsonSampler

router = APIRouter(prefix="/v1", tags=["runtime"])


@router.get("/assign", response_model=AssignResponse)
async def assign_variant(
    site_id: str,
    visitor_id: str,
    db: Session = Depends(get_db),
):
    site = db.query(Site).filter(Site.id == uuid.UUID(site_id)).first()
    if not site or site.status != "running":
        raise HTTPException(status_code=404, detail="Site not found or not running")

    variants = (
        db.query(Variant, ExperimentStats)
        .join(ExperimentStats, Variant.id == ExperimentStats.variant_id, isouter=True)
        .filter(Variant.site_id == uuid.UUID(site_id))
        .filter(Variant.status == "active")
        .all()
    )

    if not variants:
        raise HTTPException(status_code=404, detail="No active variants")

    variant_data = []
    for variant, stats in variants:
        alpha = stats.alpha if stats else 1.0
        beta = stats.beta if stats else 1.0
        variant_data.append((str(variant.id), alpha, beta))

    selected_id = ThompsonSampler.select_variant(variant_data, visitor_id)

    selected_variant = next(v for v, _ in variants if str(v.id) == selected_id)

    return AssignResponse(
        variant_id=selected_id,
        patch=selected_variant.patch or {},
    )


@router.post("/event", response_model=EventResponse)
async def record_event(
    request: EventRequest,
    db: Session = Depends(get_db),
):
    event = Event(
        id=uuid.uuid4(),
        site_id=uuid.UUID(request.site_id),
        variant_id=uuid.UUID(request.variant_id),
        visitor_id=request.visitor_id,
        event_type=request.type,
        event_metadata=request.metadata or {},
    )
    db.add(event)
    db.commit()

    return EventResponse(status="recorded")
