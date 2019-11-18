
var client = require('../connection.js');
var getNSessionsSpecificUser = require('../get-sessions.js');


var getDurationTimeRange = function getDurationTimeRange(user, from, to, callback) {

	client.search({
		index: 'sessions',
		body: {
			query: {
				bool: {
					must: [
					  {
						match: {
							username: user
						}
					  },
					  {
						match: {
							valid: true
						}
					  },
					  {
						  range: {
							end: {
								gte: from,
								lt: to
							}
						  }
					  }
					]
				}
			},
			size: 0,
			aggs: {
				duration_over_time: {
					date_histogram: {
						field: "end",
						interval: "1d"
					},
					aggs: {
						sum_per_day: {
							sum: {
								script: "doc['end'].date.getMillis() - doc['start'].date.getMillis()"
							}
						}


					}
				}
			}
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

exports.getSessions = function (req, res) {

	var messageBody = req.body;
	console.log(messageBody);
	var sessions = [];
	console.log("Get Sessions");
	getNSessionsSpecificUser(messageBody.username,
				messageBody.noSessions,
				messageBody.pageNo,
				function(err, response, status) {
					if (err) {
						return;
					}
					console.log(response);
					console.log(response.hits.hits);
					response.hits.hits.forEach(function(hit) {
						sessions.push(hit._source);
					});
					console.log(sessions);
					res.send(sessions);
				});
}

exports.getAverage = function (req, res) {


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



}

exports.getDateHistogram = function (req, res) {

	var messageBody = req.body;
	console.log(messageBody);
	var duration_per_day = [];
	getDurationTimeRange(messageBody.username, messageBody.from,
		messageBody.to,
		function (err, response, status) {

			if (!response || err)
				return;

			console.log(response);


			var buckets = response.aggregations['duration_over_time'].buckets;

			if (!buckets || !buckets.length) {
				console.log("No buckets");
				res.send(duration_per_day);
				return;
			}

			buckets.forEach(function(bucket) {
				var day = bucket.key_as_string;
				var value = bucket['sum_per_day'].value;

				duration_per_day.push({
					day: day,
					value: value
				});
			});

			console.log(duration_per_day);
			res.send(duration_per_day);

	


		});



};
