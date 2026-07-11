const fs = require('fs');
const http = require('http');
const path = require('path');

const earlyAccessHandler = require('../api/early-access');

const root = path.resolve(__dirname, '..');
const preferredPort = Number(process.env.PORT || 3000);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function loadEnvFile(filename) {
  var filePath = path.join(root, filename);
  if(!fs.existsSync(filePath)) return;

  fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach(function(line) {
    var trimmed = line.trim();
    if(!trimmed || trimmed.indexOf('#') === 0) return;

    var match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if(!match) return;

    var key = match[1];
    var value = match[2].trim();
    if((value[0] === '"' && value[value.length - 1] === '"') || (value[0] === "'" && value[value.length - 1] === "'")) {
      value = value.slice(1, -1);
    }

    if(process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

function send(res, statusCode, body, contentType) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', contentType || 'text/plain; charset=utf-8');
  res.end(body);
}

function isBlockedStaticPath(filePath) {
  var relative = path.relative(root, filePath);
  if(relative.indexOf('..') === 0 || path.isAbsolute(relative)) return true;

  var parts = relative.split(path.sep);
  if(parts.some(function(part) { return part.indexOf('.') === 0; })) return true;

  return parts[0] === 'api' || parts[0] === 'scripts';
}

function serveStatic(req, res, pathname) {
  var safePathname;
  try {
    safePathname = decodeURIComponent(pathname);
  } catch (error) {
    return send(res, 400, 'Bad request');
  }

  if(safePathname === '/') {
    safePathname = '/index.html';
  }

  var filePath = path.resolve(root, '.' + safePathname);
  if(isBlockedStaticPath(filePath)) {
    return send(res, 404, 'Not found');
  }

  fs.stat(filePath, function(error, stat) {
    if(error || !stat.isFile()) {
      return send(res, 404, 'Not found');
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  });
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const server = http.createServer(function(req, res) {
  var requestUrl = new URL(req.url, 'http://' + req.headers.host);

  if(requestUrl.pathname === '/api/early-access') {
    Promise.resolve(earlyAccessHandler(req, res)).catch(function(error) {
      console.error(error);
      send(res, 500, JSON.stringify({ message: 'Something went wrong.' }), 'application/json; charset=utf-8');
    });
    return;
  }

  serveStatic(req, res, requestUrl.pathname);
});

function listen(port, attemptsLeft) {
  server.once('error', function(error) {
    if(error.code === 'EADDRINUSE' && attemptsLeft > 0) {
      listen(port + 1, attemptsLeft - 1);
      return;
    }

    throw error;
  });

  server.listen(port, function() {
    console.log('ByteWave landing dev server: http://localhost:' + port);
  });
}

listen(preferredPort, 20);
