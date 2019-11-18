var client = require('../connection.js'); 
var getNSessionsSpecificUser = require('../get-sessions.js')


var getHitsFromResponse = function getHitsFromResponse(response) {
	return response.hits.hits;
}

exports.modifySession = function (req, res) {

	var messageBody = req.body;
	console.log(messageBody);
	getNSessionsSpecificUser(messageBody.username, 1, 1,
		function(error, response, status) {
			console.log(error);

			var hits = getHitsFromResponse(response);
			if (hits.length >= 0 &&
				hits[0] &&
				hits[0]._source.valid ^ messageBody.active) {
				
				
				res.send({error: 'INVALID ACTION'});
				console.log("ERR");
				return;
			}

			if (!messageBody.active && (hits.length == 0 ||
				!hits[0])) {
				
				
				console.log(response.hits);
				res.send({error: 'INVALID ACTION'});
				console.log("ERR");
				return;

			}
		
			var id;
			var start = new Date().getTime();
			var end = start;
			var valid = false;
			console.log(id);
			if (!messageBody.active) {
				id = hits[0]._id;
				start = hits[0]._source.start;
				valid = true;
			}

			client.index({
				index: 'sessions',
				type: 'default',
				id: id,
				body: {
					"username"	: messageBody.username,
					"start"		: start,
					"end"		: end,
					"valid"		: valid
				}
			},function(err, resp, status) {
				if (err) {
					res.send({error: 'ES error'});
				}
				res.send("OK");
				console.log(resp);
			});
			
		
		});



}

