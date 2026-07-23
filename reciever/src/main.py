import json
import os
import threading
from typing import Any

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from database import ECEFWrite, fetchLatestECEFData, fetchLatestLocationData, geographyPositionWrite
from tools.connection import createConnection
from tools.types import ECEF
from tools.conversion import ECEFToLongLatHeight
from tools.log import log
from database import ECEFWrite, geographyPositionWrite
from dotenv import load_dotenv
import os
from pydantic import ValidationError

## there are better ways to do this
load_dotenv()

app = FastAPI(title="GeoData API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/recentData")
def get_recent_data(
    limit: int = Query(default=10, ge=1),
    startDate: str | None = Query(default=None, alias="startDate"),
    endDate: str | None = Query(default=None, alias="endDate"),
):
    return {
        "locations": fetchLatestLocationData(limit=limit, start_date=startDate, end_date=endDate),
        "ecef": fetchLatestECEFData(limit=limit, start_date=startDate, end_date=endDate),
    }


def checkForMessages():
    rabbitmq_connection = createConnection()
    channel = rabbitmq_connection.channel()
    channel.basic_consume(
        queue=os.getenv("RABBIT_QUEUE_NAME"), 
        on_message_callback=messageCallback, 
        auto_ack=True
    )
    channel.start_consuming()


def messageCallback(_channel, _method, _properties, body: Any):
    """
    RabbitMQ Message Callback for when a message is received
    """
    try:
        log("Message Recieved! Writing to database...")
        ECEF_Data = ECEF(**json.loads(body.decode()))
        ECEFWrite(ECEF_Data)
        geographyPositionWrite(ECEFToLongLatHeight(ECEF_Data))
    except json.JSONDecodeError:
        log(f"Invalid JSON received: {body.decode()}")
        return
    except ValidationError as validationError:
        log(f"passed JSON cannot be cast to object: {validationError}")


def main():
    consumer_thread = threading.Thread(target=checkForMessages, daemon=True)
    consumer_thread.start()
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
