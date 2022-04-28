const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const ws = require("ws");
const net = require("net");
const bodyParser = require("body-parser");
const { platform } = require('os');
const { exec } = require('child_process');

// used for finding the current OS
const WINDOWS_PLATFORM = 'win32';
const LINUX_PLATFORM = 'linux';
const osPlatform = platform();

// holds command and the url we want to open. 
let command;
let url = "localhost:3000"

// set the open command
if (osPlatform === WINDOWS_PLATFORM) {
    command = `start microsoft-edge:${url}`;
}
else {
    command = `xdg-open ${url}`;
}

// output the command for debug
console.log(`executing command: ${command}`);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const wss = new ws.Server({ port: 1234 });

const clients = new Map();
wss.on("connection", (ws) => {
    console.log("ws connection");
    clients.set(ws, false);
    ws.on("message", (data) => {
        const message = JSON.parse(data);
        console.log("User Connected! ID:" + message.id);
    });
    ws.on("close", () => {
        clients.delete(ws);
        console.log("connection closed");
    });
});

app.use(express.static(__dirname + '/pages'));
app.get("/", (req, res) => { res.sendFile(path.join(__dirname, 'pages/index.html')); });
app.post("/", (req, res) => {
    console.log(req.body.ip);
    //s.write(JSON.stringify(req.body.ip));
    console.log("JSON FINISHED IN APP.POST");
    res.end();
});

var s;
app.listen(3000, () => {
    console.log('Server started!');

    // execute command to open the browser window.
    exec(command);

    let localSocketStarted = false;
    var localSocket = net.createServer(function(socket) {
        console.log("ATACNAV Client Connected!");

        s = socket;
        // listen for close event
        socket.on("close", () => {
            console.log("ATACNAV Client Disconnected");
            localSocketStarted = false;
        });

        socket.on("data", function (data) {
            // parse data and notify
            const message = JSON.parse(data);
            console.log("Received Data From ATACNAV Client");
            console.log(JSON.stringify(message));
            // forward data to web client.
            [...clients.keys()].forEach((client) => { client.send(JSON.stringify(message));
            });
        });
    });

    setInterval(function() {
        if (localSocketStarted == false) {
            localSocket.close();
            if (fs.existsSync("./sync.sock")) {
                fs.unlinkSync("./sync.sock");
            }
            localSocket.listen("./sync.sock");
            localSocketStarted = true;
        }
    });
});