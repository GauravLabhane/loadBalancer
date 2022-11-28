const express = require('express');
const a = require('axios');
const app = express();


app.get('/', function (req, res) {
    console.log('serving request---');
    res.send('Hello from Server 1');
 })
 

 var server = app.listen(8081, function () {
    var port = server.address().port;
    console.log("Example app listening at http://localhost:%s", port)
 })