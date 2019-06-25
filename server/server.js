const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const ROOT_DIR = "../";

const ACTIVE_USERS = 1;
const INACTIVE_USERS = 0;
const ALL_USERS = 2;

app.use(bodyParser.json());
app.use(express.static(ROOT_DIR + 'app'));

var client = require('./connection.js');

client.ping({ requestTimeout: 30000 }, function(error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});


var getLastNActionsSpecificUser = function getLastNActionsSpecificUser(user, N, callback) {

	client.search({
		index: 'sessions',
		body: {
			query: {
				match: {
					Username: user
				}
			},
			sort: [
				{
					Timestamp: {order: "desc"}
				}
			],
			size: N
		}
	}, callback);
				





}


var getAverageSessionDurationSpecificUser = function getAverageSessionDuratonSpecificUser(user, callback) {

	client.search({
		index: 'sessions',
		body: {
			query: {
				match: {
					Username : user
				}
			},
			aggs: {
				status: {
					temps: {
						field: 'Timestamp',
						order: { _key : 'desc' }
					},
					aggs: {
							
						

					
					}
			}





}

var getUsers = function getUsers(res, active) {


	var users = [];


	client.search({
		index: 'sessions',
		
		body: {
			size: 0,
			aggs: {
				username: {
					terms: {
						field: "Username"
					},

					aggs: {
						top_username_hits: {
							top_hits : {
								sort: [
								  {
									"Timestamp" : {
										"order": "desc"
									}
								  }
								],
								_source: {
									includes: [ "Username", "Timestamp", "active"]
								},
								size: 1
							}
						
						}
					}

				}
			}
		
		}
	}, function(err, response, status) {
		if (err) {
			return;
		}

		console.log(err);
		console.log(response.aggregations['username'].buckets[0]['top_username_hits'].hits.hits);
		response.aggregations['username'].buckets.forEach(function(bucket) {
			var user = bucket['top_username_hits'].hits.hits[0]._source;
			if (user.active == active || active == ALL_USERS) {
				console.log(user);
				users.push(user);
			}
		});
		console.log(users);
		res.send(users);

	});






}

app.get('/', (req, res) => res.sendFile('app/index.html'));

app.post("/connect", function(req, res) {

	var messageBody = req.body;
	console.log(messageBody);
	getLastNActionsSpecificUser(messageBody.username, 1, 
		function(error, response, status) {
			if (response.hits.hits.length >= 0 &&
				response.hits.hits[0] &&
				response.hits.hits[0]._source.active == messageBody.active) {
				res.send({error: 'INVALID ACTION'});
				console.log("ERR");
				return;
			}


			client.index({
				index: 'sessions',
				type: 'default',
				body: {
					"Username"	: messageBody.username,
					"Timestamp"	: new Date().getTime(),
					"active"	: messageBody.active
				}
			},function(err, resp, status) {
				if (err) {
					res.send({error: 'ES error'});
				}
				res.send("OK");
				console.log(resp);
			});
			
		
		});


});

app.get("/users", function(req, res) {

	console.log("Showing all users");

	getUsers(res, ALL_USERS);

});

app.get("/onlineUsers", function(req, res) {

	console.log("Showing active users");
	getUsers(res, ACTIVE_USERS);


});
app.get("/offlineUsers", function(req, res) {

	console.log("Showing inactive users");
	getUsers(res, INACTIVE_USERS);

});


app.post("/getSessions", function(req, res) {
	
	var messageBody = req.body;
	var sessions = [];
	getLastNActionsSpecificUser(messageBody.username,
				messageBody.noSessions * 2,
				function(err, response, status) {
					if (err) {
						return;
					}
					console.log(response);
					response.hits.hits.forEach(function(hit) {
						sessions.push(hit._source);
					});
					console.log(sessions);
					res.send(sessions);
				});



});



app.listen(port, () => console.log(`App listening on port ${port}!`))
