// server/log.js
// He thong ghi log JSON Lines vao thu muc logs/ va in ra console, ghi nhan chi so hieu nang perf.
// Phu thuoc: fs, path.

'use strict';

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.resolve(__dirname, '..', 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function getLogFileName() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `server-${yyyy}${mm}${dd}-${hh}${min}.log`;
}

const currentLogPath = path.join(LOGS_DIR, getLogFileName());
const logStream = fs.createWriteStream(currentLogPath, { flags: 'a' });

function writeLog(lvl, tag, msg, data = {}) {
  const entry = {
    ts: new Date().toISOString(),
    lvl: lvl,
    tag: tag,
    msg: msg,
    data: data
  };

  const line = JSON.stringify(entry) + '\n';
  logStream.write(line);

  // In ra console ngan gon
  const consoleMsg = `[${entry.ts}] [${lvl}] [${tag}] ${msg}`;
  if (lvl === 'ERROR') {
    console.error(consoleMsg, Object.keys(data).length > 0 ? data : '');
  } else if (lvl === 'WARN') {
    console.warn(consoleMsg, Object.keys(data).length > 0 ? data : '');
  } else {
    console.log(consoleMsg);
  }
}

const logger = {
  info: (tag, msg, data) => writeLog('INFO', tag, msg, data),
  warn: (tag, msg, data) => writeLog('WARN', tag, msg, data),
  error: (tag, msg, data) => writeLog('ERROR', tag, msg, data),
  dbg: (tag, msg, data) => writeLog('DBG', tag, msg, data),
  perf: (data) => writeLog('INFO', 'perf', 'Chi so hieu nang server', data),
  // Ghi dong bo (khong qua stream) vi process sap thoat, stream chua kip ghi se mat log
  fatal: (tag, msg, data = {}) => {
    const entry = { ts: new Date().toISOString(), lvl: 'ERROR', tag: tag, msg: msg, data: data };
    try {
      fs.appendFileSync(currentLogPath, JSON.stringify(entry) + '\n');
    } catch (e) {
      // Khong ghi duoc file thi van in ra console ben duoi
    }
    console.error(`[${entry.ts}] [ERROR] [${tag}] ${msg}`, Object.keys(data).length > 0 ? data : '');
  }
};

module.exports = logger;
