var client = require('./connection.js');

module.exports = function getNSessionsSpecificUser(user, N, pageNo, callback) {

	client.search({
		index: 'sessions',
		body: {
			query: {
				regexp: {
					"username.keyword" : {
						value: user
					}
				}
			},
			sort: [
				{
					end: {order: "desc"}
				}
			],
			size: N,
			from: (pageNo - 1) * N
		}
	}, callback);
				

}
