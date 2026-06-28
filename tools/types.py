from pydantic import BaseModel


class ECEF(BaseModel):
    ECEF_x: float
    ECEF_y: float
    ECEF_z: float
    timestamp: float
    device_uuid: str

class LongLatHeight(BaseModel):
    longitude: float
    latitude: float
    altitude: float
    timestamp: float
    device_uuid: str