const express = require('express'),
    bodyParser = require('body-parser'),
    { exec } = require('child_process'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

const port = process.env.PORT || 5000;

// parse post body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// serve the main page
app.get('/', function(req, res) {
    res.send('Welcome');
});

// listen for socket connections
io.on('connection', function(socket) {
    console.log('a user connected');
})

app.post('/command', function(req, res) {
    let commandJson = req.body;
    // TODO process the command.
    
    // linux cli can be accessed like this
    exec('ls', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return;
        }
        console.log(stdout);
    });
    
    // respond
    // we can also wait for the robot to do its thing before replying.
    res.status(200).send('command received.');
});

http.listen(port, function() {
    console.log('Listening on ' + port);
});
