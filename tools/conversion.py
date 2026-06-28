import pymap3d as pm
from tools.types import ECEF, LongLatHeight
from pydantic import ValidationError
from tools.log import log

def ECEFToLongLatHeight(ECEF: ECEF) -> LongLatHeight | None:
    """
    Converts ECEF coordinates to latitude, longitude, and altitude.
    TODO: This casts to variables in an unecessary way. I think there is likely a better way
    Returns:
        latitude, longitude, and altitude
    """
    try:
        # do not like how this is converted. Need to look into how to do this correctly
        latitude, longitude, altitude = pm.ecef2geodetic(ECEF.ECEF_x, ECEF.ECEF_y, ECEF.ECEF_z)
        return LongLatHeight(
            latitude=latitude,
            longitude=longitude,
            altitude=altitude,
            timestamp=ECEF.timestamp,
            device_uuid=ECEF.device_uuid)
    except ValidationError as e:
        log(f"Validation error: {e}")
        return None