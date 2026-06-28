## Basic Geographic data converter ##

### simulates data from a receiver into a rabbit MQ queue. Then is consumed by a reader that writes to a database ###

Assuming docker is installed this can be run by just using the docker-compose file and configuring a .env file.

There is an included example.env that contains everything but likely the password should be altered in a real enviornment. so simply copy it with the updated changes.
```bash
cp example.env .env
docker-compose up
```


## TODO: ##
### Items that I think are missing and need to be done better or at all ###
- [ ] a way to cleanup old entries in the db for the ECEF entries
- [ ] A queue manager of some variety (using rabbitMQ but I suspect this would not be sufficient)
- [ ] Any type of processing time for any of the core functions and any optimizations
- [ ] Logging is just printing. This works OK as is as it leans on docker logging
- [ ] The connection should be more persistent. Turning it off and on is really not ideal
- [ ] There are no triggers for when the device uuid does not match anything in the database. Causing it to write another one. This is mainly because checking every time is too expensive. I'd like to try the following strategies (in no particular order)
	- just writing the uuid that comes over and ignoring whether or not it exists
	- researching if there is any sql logic that solves this issue using sub-queries of some variety
	- keeping a local log of UUID's and only writing a new one if it is not in the local log. The local log is initiated by database and refreshes whenever there is a miss by first attempting a write to the db then re-pulling all devices
- [ ] There is overall a lack of documentation
- [ ] Rabbit MQ has its queue "created" in every action. This is overkill but the initialization file gave me trouble. 
	- Went on the back-burner because RabbitMQ is likely not the actual message manager ultimately
- [ ] Environment variables are done in a very sloppy way that I do not like but functionally is likely fine. either need to separate this out or pass more variables
- [ ] I think the database table names could use full names instead of short names. This is fine in a small use case, but terrible in a large one
- [ ] README leaves a bit to be desired, especially in terms of how a dev setup would work 
- [ ] Using relatively old versions of postgres/postgis and python. These likely could be upgraded but I started lower for gaurenteed compatability. Rabbit is fine as is because it is a placeholder anyways
- [ ] DB write/reads have no safety nets for failure or malformed/malicious SQL.