const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let counter = 0;

// Read counter value from file on server start
fs.readFile('counter.txt', 'utf8', (err, data) => {
  if (err) {
    console.log('Error reading counter file:', err);
  } else {
    counter = parseInt(data, 10) || 0;
  }
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('updateCounter', counter);

  socket.on('increment', () => {
    counter += 1;
    io.emit('updateCounter', counter);
    // Write the updated counter value to the file
    fs.writeFile('counter.txt', counter.toString(), (err) => {
      if (err) {
        console.log('Error writing counter file:', err);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
