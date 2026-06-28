
import os

from tools.log import log
from tools.types import ECEF, LongLatHeight
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def writeEntry(exceutionString: str):
    """
    very bare bones and has no safety checks!!!
    writes to the database the passed string. Very basic
    """
    conn = psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT_LOCAL")
    )
    cursor = conn.cursor()
    cursor.execute(exceutionString)
    conn.commit()
    conn.close()

def ECEFWrite(data: ECEF | None):
    if data is None:
        log("Empty Data passed. Skip Write to ECEF table")
        return
    writeEntry(f"""
        INSERT INTO
            ecef
            (
                timestamp,
                x_coordinate,
                y_coordinate,
                z_coordinate,
                device_id
            ) 
        VALUES
            (
                TO_TIMESTAMP({data.timestamp}),
                {data.ECEF_x},
                {data.ECEF_y},
                {data.ECEF_z},
                (
                    select
                        id
                    as 
                        deviceID
                    from
                        device
                    where uuid = '{data.device_uuid}'
                )
            );
    """)

def geographyPositionWrite(data: LongLatHeight | None):
    if data is None:
        log("Empty Data. Skip Write")
        return
    writeEntry(
        f"""
        INSERT INTO
            llh (
                timestamp,
                geography_position,
                device_id
            )
        VALUES
            (
                TO_TIMESTAMP({data.timestamp}),
                ST_SetSRID(ST_MakePoint({data.longitude}, {data.latitude}, {data.altitude}), 4326),
                (
                    select
                        id
                    as 
                        deviceID
                    from
                        device
                    where uuid = '{data.device_uuid}'
                )
            );
        """
    );
    

def WriteDeviceData(data: ECEF | LongLatHeight):
    """
    a way to detect new devices and write them to the database.
    This is a placeholder for now because there is only one "device" currently and it is hardcoded into the code
    """
    pass