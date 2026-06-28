import pika
import os
from dotenv import load_dotenv
from time import sleep

## there are better ways to do this
load_dotenv()

def createConnection() -> pika.BlockingConnection:
    while True:
        try:
            return pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=os.getenv("RABBIT_PUBSUB_ADDRESS"), 
                    port=os.getenv("RABBIT_PUBSUB_PORT"), 
                    credentials=pika.PlainCredentials(
                        username=os.getenv("RABBIT_USER"), 
                        password=os.getenv("RABBIT_PASSWORD")
                    )
                )
            )
        except pika.exceptions.AMQPConnectionError:
            print(f"Error creating connection, Likely not started. Waiting 5 seconds")
        except Exception as exception:
            print(f"Unknown error occurred: {exception}. \nWaiting 5 seconds")
        sleep(5)