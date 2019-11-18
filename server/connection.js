const elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
	host: '34.77.105.15:9200',
        log: 'error'
});


module.exports = client;
