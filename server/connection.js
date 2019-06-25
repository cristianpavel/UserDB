const elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
        host: '127.0.0.1:9200',
        log: 'error'
});


module.exports = client;
