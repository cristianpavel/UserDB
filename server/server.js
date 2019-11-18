const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const ROOT_DIR = "../";

app.use(bodyParser.json());
app.use(express.static(ROOT_DIR + 'app'));

var client = require('./connection.js');

client.ping({ requestTimeout: 30000 }, function(error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('Everything is ok');
    }
});

var homeRouter = require('./routes/home-route.js')
var usersRouter = require('./routes/users-route.js')
var userDataRouter = require('./routes/user-data-route.js')

app.use('/', homeRouter);
app.use('/users', usersRouter);
app.use('/user-data', userDataRouter);



app.listen(port, () => console.log(`App listening on port ${port}!`))
