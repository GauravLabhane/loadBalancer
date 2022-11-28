const express = require('express');

const app = express();


app.get('/', function (req, res) {
    res.send('Hello from Server 2');
 })
 

 var server = app.listen(8082, function () {
    var port = server.address().port;
    console.log("Example app listening at http://localhost:%s", port)
 })