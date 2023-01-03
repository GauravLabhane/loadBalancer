const express = require('express');
const app = express();
const axios = require('axios');
const fs = require('fs');
const _ = require('underscore');
const serverConfigs = require('./config.json');


var server = app.listen(80, function () {
    var port = server.address().port;
    console.log("Example app listening at http://localhost:%s", port)
 });

 let internalRequests = [
    '/getAllServers',
    '/addServer',
    '/removeServer'
 ]

 const handleRequest = async function(req, res) {
    let url = ''
    ;    try {
        counter += 1;
        counter = counter % servers.length;
        let server = servers[counter];
        let serverHealthCheck = await checkServerHealth(server);
        console.log(server.host, server.port ,'is Active : ', serverHealthCheck);
        if (serverHealthCheck) {
            retryCounter = 0;
            url = `${server.host}:${server.port}${req.url}`;
            const response = await axios({
                url: url,
                headers: req.headers,
                method: req.method,
                data: req.body,
                params: req.query
            });
            console.log(`getting response from ${url}`);
            return res.status(200).send(response.data);
        } else {
            retryCounter += 1;
            if(retryCounter <= servers.length) {
                await handleRequest(req,res);
            } else {
                console.log('No Servers respondiong');
                return res.status(400).send({status: 'No Servers respondiong'})
            }
        }


    } catch (error) {
        // console.error(error);
        console.log(url , ' not responding, redirecting to ', servers[(counter + 1) % servers.length].host + ':' + servers[(counter + 1) % servers.length].port + req.url);
        return res.status(400).send({msg: 'Request Failed', error: error.message});
    }
};

app.use(async function (req, res, next) {
    if(internalRequests.indexOf(req.path) == -1) {
        await handleRequest(req, res);
    }
    next();   
});
// app.get('/', function (req, res) {
//     handleRequest(req, res);
//  })
 

let servers = serverConfigs.servers;
console.log(servers);
let counter = -1;

let retryCounter = 0;



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
    let duplicateCheck = _.filter(configs, (server)=> {
        return server.host == newServer.host && server.port == newServer.port;
    });
    if(!duplicateCheck) {
        configs.servers.push(newServer);
        fs.writeFileSync('config.json', JSON.stringify(configs), function (err) {
            if (err) throw err;
            console.log('Updated!');
          });
    } else {
        res.status(200).send('Server Already Exist');
    }

    res.status(200).send('Success');
 });

 app.post('/removeServer', async function (req, res) {
    let host = req.query.host;
    let port = req.query.port;
    console.log(host, port);
    let isRemoved = removeServer(host, port);
    if(isRemoved == true) {
       return res.status(200).send('Success');
    } else if (isRemoved == false) {
        return res.status(200).send('No Server Found');
    } else {
        return res.status(200).send('Something went wrong');
    }
 });

 app.get('/getAllServers', async function (req, res) {

    let configs = fs.readFileSync('./config.json', 'utf-8');
    configs = JSON.parse(configs);
    res.status(200).send(configs.servers);
 });
 
const removeServer = function(host,port) {
    try {
        let configs = fs.readFileSync('./config.json', 'utf-8');
        configs = JSON.parse(configs);
        let servers = configs.servers;
        let initialLength = servers.length;
        console.log(servers);
        servers = _.filter(servers, ((server) => {
            return server.host !== host || server.port !== port;
        }));
        if(initialLength == servers.length) {
            return false;
        } else {
            configs.servers = servers;
            fs.writeFileSync('config.json', JSON.stringify(configs), function (err) {
                if (err) throw err;
                console.log('Updated!');
              });
            return true;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
   
}

async function checkServerHealth(server) {
    try {
        let url = `${server.host}:${server.port}/healthCheck`; 
        
        console.log(url); 
        const response = await axios({
            url: url
        });
        console.log(response.data.status, '------');
        return response.data.status;
    } catch {
        return false;
    }

}


