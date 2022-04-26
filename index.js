const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const ws = require("ws");
const net = require("net");
const bodyParser = require("body-parser");

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
    console.log(message.bam);
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
  //s.write(JSON.stringify(req.body));
  res.end(); 
});

var s;
app.listen(3333, () => {
  console.log('server started!');

  let localSocketStarted = false;
  var localSocket = net.createServer(function(socket) {
    console.log("local connection made");

    s = socket;

    socket.on("close", () => {
      localSocketStarted = false;
    });

    socket.on("data", function(data) {
      const message = JSON.parse(data);
      [...clients.keys()].forEach((client) => { client.send(JSON.stringify(message)); });
      console.log(message.data);
    });
  });

  setInterval(function() {
    if (localSocketStarted == false)
    {
      localSocket.close();
      if (fs.existsSync("/asei/bin/sync.sock"))
      {
         fs.unlinkSync("/asei/bin/sync.sock");
      }
      localSocket.listen("/asei/bin/sync.sock");
      localSocketStarted = true;
    }
  });
});

