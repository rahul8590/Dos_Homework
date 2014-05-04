#!/bin/bash

: ' To Request Other URLS. Only change the curl parameter 
http://localhost:8590/getinfo/rome
http://localhost:8590/getinfo/gual
http://localhost:8590/getscore/curling 
http://localhost:8590/getscore/skiing

Duration of Request can be changed by changing sleep <value>
Currently its set to 5. You could change it as long/short as you want.
'

echo "Requesting Information From Server"

#Client Keeps Pooling from the server every 5 seconds for updated score. 
for i in {1..20}
do
	curl http://localhost:8590/getinfo/rome 
	echo "\n"
	sleep 5 
done