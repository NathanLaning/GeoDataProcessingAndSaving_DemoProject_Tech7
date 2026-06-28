## Basic Geographic data converter ##

### simulates data from a receiver into a rabbit MQ queue. Then is consumed by a reader that writes to a database ###

Assuming docker is installed this can be run by just using the docker-compose file and configuring a .env file.

There is an included example.env that contains everything but likely the password should be altered in a real enviornment. so simply copy it with the updated changes.
```bash
cp example.env .env
docker-compose up
```
