var client = require('../connection.js')
var getNSessionsSpecificUser = require('../get-sessions.js');


const ACTIVE_USERS = 1;
const INACTIVE_USERS = 0;
const ALL_USERS = 2;
const MAX_INTEGER32 = 2147483647;

var firstSessionAggregation =  function firstSessionAggregation(lastUser, noUsers) {
		return	{
				username: {
					composite: {
						size: noUsers,
						after: lastUser,	
						sources: [
						  {
							username: {
								terms: {
									field: "username.keyword",
								}
							}
						  }
						]
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
};

var getUsersMatchRegex = function getUsersMatchRegexp(regex, lastUser, noUsers, callback) {


	client.search({
		index: 'sessions',
		body: {
			query: {
				regexp: {
					"username.keyword" : {
						value: regex
					}
				}
			},
			size: 0,
			aggs: firstSessionAggregation(lastUser, noUsers)
		}
	}, callback);
				
	



}

var getUsers = function getUsers(lastUser, noUsers, callback) {


	var users = [];


	client.search({
		index: 'sessions',
		
		body: {
			size: 0,
			aggs: firstSessionAggregation(lastUser, noUsers)
		
		}
	}, callback);
}

var getNMostProductiveUsers = function getNMostProductiveUsers(N, callback) {

	client.search({
		index: 'sessions',
		body: {
			size: 0,
			query: {
				match: {
					valid: true
				},
			},
			aggs: {
				username: {
					terms: {
						field: 'username.keyword',
						size: MAX_INTEGER32 
					},
					aggs: {
						avg_duration: {
							avg: {
								script: "doc['end'].date.getMillis() - doc['start'].date.getMillis()"	
							}
						},
						avg_bucket_sort: {
							bucket_sort: {
								sort: [
								  {
									avg_duration: { order: "desc"}
								  }
								],
								size: N
							}
						}
					}
				}


			}
		}

	}, callback);

}

var getBucketsFromAggregation = function getBucketsFromAggregation(response, agg_name) {
	return response.aggregations[agg_name].buckets;
}

var getHitsFromNestedAggregation = function getHitsFromBucket(agg, nested_agg_name) {
	return agg[nested_agg_name].hits.hits;
}

var callbackESGetUsers = function callbackESGetUsers(res, active, noUsers, users, regex) {
	
	return function(err, response, status) {
		
		if (err) {
			return;
		}

		var buckets = getBucketsFromAggregation(response, 'username');
		if (buckets.length == 0 ||
			!buckets[0]) {
			res.send(users);
			return;
		}

		
		buckets.forEach(function(bucket) {
			var hits = getHitsFromNestedAggregation(bucket, 'top_username_hits');
			var user = hits[0]._source;
			if ((user.valid ^ active) || active == ALL_USERS) {
				console.log(user);
				users.push(user);
			}
		});

		if (users.length < noUsers) {
			console.log("Another call to get user");
			var lastHits = getHitsFromNestedAggregation(buckets[buckets.length - 1], 'top_username_hits');
			if (regex) {
				getUsersMatchRegex(
					regex,
					{
						username: lastHits[0]._source.username
					},
					noUsers - users.length,
					callbackESGetUsers(res, active, noUsers, users, regex));

			} else {
				getUsers(
					{
						username: lastHits[0]._source.username
					},
					noUsers - users.length,
					callbackESGetUsers(res, active, noUsers, users));
			}
		} else {

			console.log(users);
			res.send(users);
		}

	};
}

exports.getAllUsers = function(req, res) {

	var messageBody = req.body;
	console.log(messageBody);
	getUsers(messageBody.lastUser,
		messageBody.noUsers,
		callbackESGetUsers(res, ALL_USERS, messageBody.noUsers, []));

}

exports.getActiveUsers = function(req, res) {
	
	var messageBody = req.body;
	console.log(messageBody);
	getUsers(messageBody.lastUser,
		messageBody.noUsers,
		callbackESGetUsers(res, ACTIVE_USERS, messageBody.noUsers, []));



}

exports.getInactiveUsers = function(req, res) {
	
	var messageBody = req.body;
	console.log(messageBody);
	getUsers(messageBody.lastUser,
		messageBody.noUsers,
		callbackESGetUsers(res, INACTIVE_USERS, messageBody.noUsers, []));

}


exports.getProductiveUsers = function(req, res) {

	var messageBody = req.body;
	console.log(messageBody);
	var users = [];
	getNMostProductiveUsers(messageBody.noUsers, function(err, response, status) {

		console.log(err);
		console.log(response.aggregations.username.buckets);
		response.aggregations.username.buckets.forEach(function(bucket) {
			users.push(
				{
					username: bucket.key,
					avg: bucket.avg_duration.value
				}
			);

		});

		res.send(users);


	});

};

exports.getSpecificUser = function (req, res) {



	var messageBody = req.body;
	console.log(messageBody);
	getUsersMatchRegex(messageBody.username, messageBody.lastUser,
		messageBody.noUsers,
		callbackESGetUsers(res, ALL_USERS, messageBody.noUsers, [], messageBody.username));


};
