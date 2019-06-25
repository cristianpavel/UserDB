var client = require('./connection.js');

client.indices.delete({
        index: 'sessions',
}, function (err, resp, status)  {
        if (err) {
                console.log(err);
        } else {
                console.log("create", resp);
        }
});

