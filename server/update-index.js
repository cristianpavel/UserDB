var client = require('./connection.js')

client.indices.putSettings({

	index: 'sessions',
	body: {

		index: {
			number_of_replicas: 0
		}
	}
});
