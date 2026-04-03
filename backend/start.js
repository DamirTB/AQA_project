// backend/start.js
const fs = require('fs');
const path = require('path');

const endpoint = 'http://127.0.0.1:7421/ingest/4c6afe1b-9c8d-438d-a14e-230f8cd3722a';
const basePayload = {
  sessionId: '1d21ba',
  runId: 'initial',
  timestamp: Date.now(),
};

function sendLog(hypothesisId, location, message, data) {
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '1d21ba',
    },
    body: JSON.stringify({
      ...basePayload,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

const target = path.join(__dirname, 'dist', 'server.js');

sendLog('H1', 'backend/start.js:33', 'Backend startup probe entered', {
  cwd: process.cwd(),
  dirname: __dirname,
});

sendLog('H2', 'backend/start.js:38', 'Target dist file existence check', {
  target,
  exists: fs.existsSync(target),
});

sendLog('H3', 'backend/start.js:43', 'App directory listing snapshot', {
  appEntries: fs.readdirSync(__dirname).sort(),
  distEntries: fs.existsSync(path.join(__dirname, 'dist'))
    ? fs.readdirSync(path.join(__dirname, 'dist')).sort()
    : [],
});

sendLog('H4', 'backend/start.js:51', 'Node module resolution context', {
  nodeVersion: process.version,
  mainScript: process.argv[1],
});

require('./dist/server.js');