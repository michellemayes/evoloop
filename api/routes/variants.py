import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from db.models import Variant
from schemas.variants import VariantUpdate, VariantResponse, VariantDiff

router = APIRouter(tags=["variants"])


def variant_to_response(variant: Variant) -> VariantResponse:
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
    )


@router.get("/api/sites/{site_id}/variants", response_model=List[VariantResponse])
async def list_variants(site_id: str, db: Session = Depends(get_db)):
    variants = db.query(Variant).filter(Variant.site_id == uuid.UUID(site_id)).all()
    return [variant_to_response(v) for v in variants]


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
