/**
 * WebSocket Load Testing for Real-time Features
 */

import ws from 'k6/ws';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

const WS_URL = __ENV.WS_URL || 'wss://api.vayva.ng/ws';

export default function () {
  const url = `${WS_URL}?merchantId=store_${Math.floor(Math.random() * 100)}`;
  
  const res = ws.connect(url, null, function (socket) {
    socket.on('open', () => {
      console.log('WebSocket connected');
      
      // Subscribe to real-time updates
      socket.send(JSON.stringify({
        type: 'subscribe',
        channels: ['orders', 'analytics'],
      }));
    });
    
    socket.on('message', (data) => {
      const message = JSON.parse(data);
      check(message, {
        'message has type': (m) => m.type !== undefined,
      });
    });
    
    socket.on('close', () => {
      console.log('WebSocket disconnected');
    });
    
    socket.setTimeout(function () {
      socket.close();
    }, 30000);
  });
  
  check(res, {
    'WebSocket connection established': (r) => r && r.status === 101,
  });
  
  sleep(1);
}
