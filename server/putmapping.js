var client = require('./connection.js');

client.indices.putMapping({
        index: 'sessions',
        type: 'default',
        body: {
                properties: {
                        Username: {
                                type : 'text',
                                fielddata: 'true'
                        },
                        Timestamp: {type : 'date' },
                        active: {
                                type: 'integer'
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

