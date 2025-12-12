from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class VariantUpdate(BaseModel):
    status: Optional[str] = None


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

    class Config:
        from_attributes = True


class VariantDiff(BaseModel):
    variant_a: str
    variant_b: str
    changes: Dict[str, Any]
