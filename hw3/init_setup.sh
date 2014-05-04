#!/bin/bash

#Redis DataStore
#The following are the redis command to be executed while initial setup
#-----------------

redis-cli hmset rome gold 1  bronze 1 silver 1 
redis-cli hmset gual gold 1  bronze 1 silver 1

redis-cli hmset curling rome 5 gual 10 
redis-cli hmset skiing  rome 6 gual 15

#hgetall rome
#hget rome gold 


: '
Javascript based commands 
--------------------------

client.hmset("hosts", "mjr", "1", "another", "23", "home", "1234");

clien.hgetall("rome",function(err,obj) {
... console.log(obj)
... })
'


