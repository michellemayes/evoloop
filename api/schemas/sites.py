from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class SiteCreate(BaseModel):
    url: str
    user_id: str


class SiteUpdate(BaseModel):
    status: Optional[str] = None
    autonomy_mode: Optional[str] = None
    brand_constraints: Optional[Dict[str, Any]] = None
    image_generation_enabled: Optional[bool] = None


class SiteResponse(BaseModel):
    id: str
    user_id: str
    url: str
    status: str
    autonomy_mode: str
    approvals_remaining: int
    brand_constraints: Dict[str, Any]
    image_generation_enabled: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
