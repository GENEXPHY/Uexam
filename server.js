#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url);

  // Handle trailing slashes
  if (req.url.endsWith('/') && req.url !== '/') {
    filePath = path.join(filePath, 'index.html');
  }

  // Default to index.html
  if (!path.extname(filePath)) {
    filePath = path.join(filePath, 'index.html');
  }

  // Security: prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Try index.html for SPA routing
        fs.readFile(path.join(DIST_DIR, 'index.html'), (indexErr, indexContent) => {
          if (indexErr) {
            res.statusCode = 404;
            res.end('404 Not Found');
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(indexContent);
          }
        });
      } else {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Uexam Server Running!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📁 Serving: ${DIST_DIR}`);
  console.log(`\nPress Ctrl+C to stop\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log(`Try: PORT=3000 node server.js`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
