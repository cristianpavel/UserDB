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
					username: user
				}
			},
			sort: [
				{
					end: {order: "desc"}
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
				bool : {
					must: [
					  {
						match: {
							username : user
						
						}
					  },
					  {	
						match: {
							valid: true
						}
					  }
					]
					
				}
				
			},
			aggs: {
				avg_duration: {
					avg: {
						script: "doc['end'].date.getMillis() - doc['start'].date.getMillis()"
					
					}
				}
				
			}
		}
	}, callback);





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
						field: "username"
					},

					aggs: {
						top_username_hits: {
							top_hits : {
								sort: [
								  {
									"end" : {
										"order": "desc"
									}
								  }
								],
								_source: {
									includes: [ "username", "start", "end", "valid"]
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
			if (user.valid != active || active == ALL_USERS) {
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
			console.log(error);
			if (response.hits.hits.length >= 0 &&
				response.hits.hits[0] &&
				response.hits.hits[0]._source.valid ^ messageBody.active) {
				res.send({error: 'INVALID ACTION'});
				console.log("ERR");
				return;
			}

			if (!messageBody.active && (response.hits.hits.length == 0 ||
				!response.hits.hits[0])) {
				console.log(response.hits);
				res.send({error: 'INVALID ACTION'});
				console.log("ERR");
				return;

			}
		
			var id = undefined

			if (!messageBody.active) {
				var hit = response.hits.hits[0];
				client.index({
					index: 'sessions',
					type: 'default',
					id: hit._id,
					body: {
						"username"	: hit._source.username,
						"start"		: hit._source.start,
						"end"		: new Date().getTime(),
						"valid"		: true
					}
				},function(err, resp, status) {
					if (err) {
						res.send({error: 'ES error'});
					}
					res.send("OK");
					console.log(resp);
				});
			} else {
				client.index({
					index: 'sessions',
					type: 'default',

					body: {
						"username"	: messageBody.username,
						"start"		: new Date().getTime(),
						"end"		: new Date().getTime(),
						"valid"		: false
					}
				},function(err, resp, status) {
					if (err) {
						res.send({error: 'ES error'});
					}
					res.send("OK");
					console.log(resp);
				});
			}
			
		
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
	console.log("Get Sessions");
	getLastNActionsSpecificUser(messageBody.username,
				messageBody.noSessions,
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


app.post("/getAverageDuration", function(req, res) {

	var messageBody = req.body;
	var average;
	console.log("Get Average");
	getAverageSessionDurationSpecificUser(messageBody.username,
			function(err, response, status) {
				console.log(err);
				console.log(response.aggregations['avg_duration'].value);
				res.send({
					avg: response.aggregations['avg_duration'].value
				});
			});


});


app.listen(port, () => console.log(`App listening on port ${port}!`))
