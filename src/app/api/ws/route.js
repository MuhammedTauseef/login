// app/api/ws/route.js
import { NextResponse } from 'next/server';
import { WebSocketServer } from 'ws';

let clients = [];

export function GET() {
  if (!global.wsServer) {
    // WebSocket سرور کی ابتدائیہ کریں
    const wss = new WebSocketServer({ noServer: true });

    wss.on('connection', (socket) => {
      clients.push(socket);
      console.log('New WebSocket connection');

      socket.on('close', () => {
        clients = clients.filter((s) => s !== socket);
        console.log('WebSocket connection closed');
      });
    });

    // WebSocket سرور کو گلوبل آبجیکٹ میں شامل کریں تاکہ ایک ہی سرور بنے رہے
    global.wsServer = wss;

    // اپگریڈ ریکویسٹ ہینڈل کریں
    if (global.wsServer) {
      global.wsServer.on('connection', (socket) => {
        // اگر ضرورت ہو تو کنکشنز ہینڈل کریں
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}

// تمام کلائنٹس کو پیغام بھیجنے کے لیے ہیلپر فنکشن
export function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
