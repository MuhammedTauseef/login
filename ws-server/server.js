// ws-server/server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('New WebSocket connection');

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log('WebSocket connection closed');
  });
});

// Function to broadcast messages to all connected clients
function broadcast(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

module.exports = { broadcast };
