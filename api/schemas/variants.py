from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class VariantCreate(BaseModel):
    site_id: str
    patch: Dict[str, Any]
    status: Optional[str] = None
    parent_variant_id: Optional[str] = None
    generation_reasoning: Optional[str] = None


class VariantUpdate(BaseModel):
    status: Optional[str] = None


class VariantStats(BaseModel):
    visitors: int
    conversions: int
    conversion_rate: float
    prob_best: float

class VariantResponse(BaseModel):
    id: str
    site_id: str
    parent_variant_id: Optional[str]
    patch: Dict[str, Any]
    screenshot_url: Optional[str]
    generation_reasoning: Optional[str]
    status: str
    created_at: datetime
    killed_at: Optional[datetime]
    stats: VariantStats

    class Config:
        from_attributes = True


class VariantDiff(BaseModel):
    variant_a: str
    variant_b: str
    changes: Dict[str, Any]
