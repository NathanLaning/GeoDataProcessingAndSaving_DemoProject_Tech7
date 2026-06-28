import json
from time import sleep as pause
from typing import Any
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
    checkForMessages()

if __name__ == "__main__":
    main()
    