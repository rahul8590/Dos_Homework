/*
Cacophonix Server 

update the server push notifications 
set_score()
incrementMedalTally()

Author: rahulram@cs.umass.edu
*/

var events = require("events");  
var stdio = require("stdio");
var ops = stdio.getopt({
	'action_type': {key: 'a', args: 1, description: 'Name of action (inc_medal,set_score)'},
    'event_name': {key: 'e', args: 1, description: 'Name of event'},
    'teamname': {key: 't', args:1 ,description: 'Name of the team'},
    'medal_type': {key: 'm',args: 1, description: 'Type of medal example gold,silver,bronze'},
    'medal_count':{key: 'c',args: 1, description: 'Number of Medal'},
    'score' : {key: 's', args: 2 , description: 'enter scores of 2 teams (rome , gual)'},
    'host': {key: 'h', args: 1, mandatory: true, description: 'localhost if same server' }
});

var redis = require('redis'),
	rclient = redis.createClient(),
	sclient = redis.createClient();		

console.log("Initializing Client ");
console.log("Updating Event for " , ops.action_type);



switch (ops.action_type){
    case 'set_score':
        console.log("setting score for a given teamname ",ops);
        rclient.hmset(ops.event_name,"rome",ops.score[0].toString(),"gual",ops.score[1].toString()); 
        sclient.publish("notif" ,"set_score updated");
        break;

    case 'inc_medal':
        console.log("updating medal ",ops , ops.medal_type)
        rclient.hmset(ops.teamname,ops.medal_type, ops.medal_count);
        sclient.publish("notif" , "inc_medal updated")
        break;

    default:
      console.log(ops.action_type , "is not supported in here")
}


console.log("-------Press Ctrl C to Exit ----------------------")
process.on('SIGINT', function() {
    console.log(" \n Caught interrupt signal. Cleaning up all the connections .. Goodbye   \n");
    console.log("                         ---------- __o");
    console.log("                       --------  _ \<,_");
    console.log("                     -------    (*)/ (*)");
    process.exit();
});




