// server/server.js
// Entry point: khoi dong HTTP server phat file tinh, WebSocket server va in dia chi IP.
// Phu thuoc: http, fs, path, os, ws.

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer } = require('ws');

// Doc cac co khoi dong tu command line
function parseArgs(args) {
  const flags = {
    port: 8080,
    seed: null,
    dev: false,
    bots: null,
    fast: false,
    noLaunch: false,
    headlessTest: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--port' && i + 1 < args.length) {
      flags.port = parseInt(args[++i], 10) || 8080;
    } else if (arg === '--seed' && i + 1 < args.length) {
      flags.seed = parseInt(args[++i], 10);
    } else if (arg === '--dev') {
      flags.dev = true;
    } else if (arg === '--bots' && i + 1 < args.length) {
      flags.bots = parseInt(args[++i], 10);
    } else if (arg === '--fast') {
      flags.fast = true;
    } else if (arg === '--no-launch') {
      flags.noLaunch = true;
    } else if (arg === '--headless-test') {
      flags.headlessTest = true;
    }
  }

  return flags;
}

const flags = parseArgs(process.argv.slice(2));
const PORT = flags.port;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ttf': 'font/ttf',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

// Xu ly yeu cau file tinh
function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  // Bo qua query string
  const urlPath = req.url.split('?')[0];
  let relativePath = '';

  if (urlPath === '/' || urlPath === '/index.html') {
    relativePath = path.join('client', 'index.html');
  } else if (urlPath.startsWith('/client/')) {
    relativePath = urlPath.slice(1);
  } else if (urlPath.startsWith('/shared/')) {
    relativePath = urlPath.slice(1);
  } else if (urlPath.startsWith('/fonts/')) {
    relativePath = path.join('client', urlPath.slice(1));
  } else if (urlPath === '/style.css') {
    relativePath = path.join('client', 'style.css');
  } else {
    // Thu kiem tra trong client/ hoac shared/
    relativePath = path.join('client', urlPath.slice(1));
  }

  const filePath = path.resolve(ROOT_DIR, relativePath);

  // Bao mat: chan truy cap ngoai thu muc goc
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer(serveStatic);
const wss = new WebSocketServer({ server });

let nextClientId = 1;
wss.on('connection', (ws) => {
  const clientId = nextClientId++;
  const isHost = (clientId === 1);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.t === 'join') {
        const welcome = {
          t: 'welcome',
          you: clientId,
          seed: flags.seed !== null ? flags.seed : 1,
          isHost: isHost,
          reconnectKey: 'rec_' + clientId,
          cfgHash: 'cfg_init',
          dev: flags.dev
        };
        ws.send(JSON.stringify(welcome));
      } else if (msg.t === 'ping') {
        const pong = {
          t: 'pong',
          c: msg.c || 0,
          s: Date.now()
        };
        ws.send(JSON.stringify(pong));
      }
    } catch (err) {
      // Bo qua message khong hop le
    }
  });

  ws.on('error', (err) => {
    // xu ly loi socket co ban
  });
});

// In danh sach IP ra man hinh
function printNetworkInfo(port) {
  const interfaces = os.networkInterfaces();
  console.log('='.repeat(50));
  console.log(`One Piece Battleground Server dang chay tai cong ${port}`);
  console.log(`- Localhost:    http://localhost:${port}`);

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (net.address.startsWith('26.')) {
          console.log(`- [RADMIN VPN]: http://${net.address}:${port} (Radmin VPN)`);
        } else {
          console.log(`- LAN:          http://${net.address}:${port}`);
        }
      }
    }
  }

  if (flags.dev) {
    console.log('- Che do DEV: BAT');
  }
  if (flags.seed !== null) {
    console.log(`- Seed co dinh: ${flags.seed}`);
  }
  console.log('='.repeat(50));
}

server.listen(PORT, () => {
  printNetworkInfo(PORT);
});

module.exports = { server, wss, flags };
