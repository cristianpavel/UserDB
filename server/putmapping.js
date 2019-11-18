var client = require('./connection.js');

client.indices.putMapping({
        index: 'sessions',
        type: 'default',
        body: {
                properties: {
                        username: {
                                type : 'text',
                        	fields: {
					keyword : {
						type: 'keyword'
					}
				}
			},
			start: {
				type: 'date'
			},
			end: {
				type: 'date'
			},
                        valid: {
                                type: 'boolean'
                        }
                }
        }
}, function (err, resp, status)  {
        if (err) {
                console.log(err);
        } else {
                console.log("create", resp);
        }
});

