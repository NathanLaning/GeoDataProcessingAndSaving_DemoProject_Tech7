from time import sleep
import os
from messageGeneration import generateFakeCoordinates
from dotenv import load_dotenv
from tools.connection import createConnection
from tools.log import log

## there are better ways to do this
load_dotenv()

def ensureQueueExists():
    """
    This should be unecessary
    """
    rabbitmq_connection = createConnection()
    channel = rabbitmq_connection.channel()
    channel.queue_declare(queue=os.getenv("RABBIT_QUEUE_NAME"), durable=True)
    rabbitmq_connection.close()


    
def sendFakeMessage(delay: int = 4):
    """
    todo: reduce class creation steps if possible.
    todo: opening and closing a connection for every message is not ideal. create a connection manager of some variety
    """
    log(f"Sending fake message to queue")
    rabbitmq_connection = createConnection()
    channel = rabbitmq_connection.channel()
    channel.basic_publish(
        exchange='',
        routing_key=os.getenv("RABBIT_QUEUE_NAME"),
        body=generateFakeCoordinates()
    )
    rabbitmq_connection.close()
    # fake timing for sending a message
    sleep(delay)
    ##############

def main():
    """
    Main loop, sends fake messages to rabbitMQ
    """
    ###############
    # Todo: remove
    # this should be handled by docker. and only happens once
    # So if for any reason the broker is down this will not even work
    ensureQueueExists()
    ###############
    while True:
        try:
            sendFakeMessage(3)
        except Exception as e:
            log(f"Error occurred: {e}")
            # Todo: Write to a real log here


if __name__ == "__main__":
    main()
    