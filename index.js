const express = require('express');
const {spawn} = require('child_process');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {

    res.sendFile(__dirname + '/index.html');

});

io.on('connection', (socket) => {
    console.log('a user connected');

    var dataToSend;
    // spawn new child process to call the python script
    const python = spawn('python', ['ultrasonic-sensor.py']);
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        dataToSend = data.toString();
        console.log('dataToSend', dataToSend);
        const distanceInCm = dataToSend
            .replace('Measured Distance = ', '')
            .replace(' cm', '')
            .trim();
        io.emit('ultrasound-distance', { distance: distanceInCm});

    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        //res.send(dataToSend)
    });
});

http.listen(port, () => console.log(`Example app listening on port 
${port}!`));
