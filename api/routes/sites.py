import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from db.models import Site
from schemas.sites import SiteCreate, SiteUpdate, SiteResponse

router = APIRouter(prefix="/api/sites", tags=["sites"])


def site_to_response(site: Site) -> SiteResponse:
    return SiteResponse(
        id=str(site.id),
        user_id=str(site.user_id),
        url=site.url,
        status=site.status,
        autonomy_mode=site.autonomy_mode,
        approvals_remaining=site.approvals_remaining,
        brand_constraints=site.brand_constraints or {},
        image_generation_enabled=bool(site.image_generation_enabled),
        created_at=site.created_at,
        updated_at=site.updated_at,
    )


@router.post("", response_model=SiteResponse)
async def create_site(request: SiteCreate, db: Session = Depends(get_db)):
    site = Site(
        id=uuid.uuid4(),
        user_id=uuid.UUID(request.user_id),
        url=request.url,
        status="analyzing",
        autonomy_mode="training_wheels",
        approvals_remaining=5,
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    return site_to_response(site)


@router.get("", response_model=List[SiteResponse])
async def list_sites(user_id: str, db: Session = Depends(get_db)):
    sites = db.query(Site).filter(Site.user_id == uuid.UUID(user_id)).all()
    return [site_to_response(s) for s in sites]


@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == uuid.UUID(site_id)).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site_to_response(site)


@router.patch("/{site_id}", response_model=SiteResponse)
async def update_site(site_id: str, request: SiteUpdate, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == uuid.UUID(site_id)).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    if request.status is not None:
        allowed_statuses = {"analyzing", "analyzed", "running"}
        if request.status not in allowed_statuses:
            raise HTTPException(status_code=400, detail="Invalid status")
        site.status = request.status
    if request.autonomy_mode is not None:
        site.autonomy_mode = request.autonomy_mode
    if request.brand_constraints is not None:
        site.brand_constraints = request.brand_constraints
    if request.image_generation_enabled is not None:
        site.image_generation_enabled = 1 if request.image_generation_enabled else 0

    db.commit()
    db.refresh(site)
    return site_to_response(site)


@router.delete("/{site_id}")
async def delete_site(site_id: str, db: Session = Depends(get_db)):
    site = db.query(Site).filter(Site.id == uuid.UUID(site_id)).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    db.delete(site)
    db.commit()
    return {"status": "deleted"}
