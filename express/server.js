const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const app = express();
const port = 3000;

app.use(cors());
app.get('/', (_, res) => res.send('WebSocket server running'));

// Start server
const server = app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

const clients = new Map(); // client -> {id, x, y, heading}

function toDegrees(rad) {
  return (rad * 180) / Math.PI;
}
function normalizeAngle(angle) {
  return (angle + 360) % 360;
}
function angleBetween(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return normalizeAngle(toDegrees(Math.atan2(dy, dx)));
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    let payload;
    try {
      payload = JSON.parse(data);
    } catch (e) {
      return;
    }

    // Update current client state
    clients.set(ws, payload);

    const others = [];

    for (const [client, info] of clients.entries()) {
      if (client === ws) continue;
      const angle = angleBetween(payload, info);
      others.push({
        id: info.id,
        x: info.x,
        y: info.y,
        angleFromThis: angle,
      });
    }

    // Send back all other clients’ positions and relative angles
    ws.send(JSON.stringify({ others }));
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});
