from time import time as timestamp
import random
import json

def generateFakeCoordinates() -> (str):
    return json.dumps({
        "ECEF_x": random.uniform(-1000000, 1000000),
        "ECEF_y": random.uniform(-1000000, 1000000),
        "ECEF_z": random.uniform(-1000000, 1000000),
        "timestamp": timestamp(),
        "device_uuid": "c9a646d3-9c61-4cd9-bc2a-4638a110a293"
    })