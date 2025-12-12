from pydantic import BaseModel
from typing import Dict, Any, Optional


class AssignResponse(BaseModel):
    variant_id: str
    patch: Dict[str, Any]


class EventRequest(BaseModel):
    site_id: str
    variant_id: str
    visitor_id: str
    type: str
    metadata: Optional[Dict[str, Any]] = None


class EventResponse(BaseModel):
    status: str
