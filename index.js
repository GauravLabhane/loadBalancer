const express = require('express');
const app = express();
const axios = require('axios');
var fs = require('fs');
const serverConfigs = require('./config.json');


var server = app.listen(80, function () {
    var port = server.address().port;
    console.log("Example app listening at http://localhost:%s", port)
 });


app.get('/', function (req, res) {
    handleRequest(req, res);
 })
 

let servers = serverConfigs.servers;
console.log(servers);
console.log(servers[0]);
let counter = -1;

const handleRequest = async function(req, res) {
    let url = ''
;    try {
        counter += 1;
        counter = counter % servers.length;
        let server = servers[counter];
        url = `${server.host}:${server.port}${req.url}`;
        const response = await axios({
            url: url,
            headers: req.headers,
            method: req.method,
            data: req.body,
            params: req.query
        });
        console.log(`gettinf response from ${url}`);
        return res.send(response.data);
        // counter += 1;
        // counter = counter % servers.length;
    } catch (error) {
        // console.error(error);
        console.log(url , ' not responding, redirecting to ', servers[(counter + 1) % servers.length].host + ':' + servers[(counter + 1) % servers.length].port + req.url);
        await handleRequest(req,res);
    }
};



 app.post('/addServer', async function (req, res) {
    let serverName = req.query.name;
    let host = req.query.host;
    let port = req.query.port;
    let configs = fs.readFileSync('./config.json', 'utf-8');
    configs = JSON.parse(configs);
    let newServer = {
        serverName,
        host,
        port
    }
    configs.servers.push(newServer);
    fs.writeFileSync('config.json', JSON.stringify(configs), function (err) {
        if (err) throw err;
        console.log('Updated!');
      });
    res.status(200).send('Success');
 });

