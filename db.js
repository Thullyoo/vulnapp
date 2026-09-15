const initSqlJs = require('sql.js');

let SQL = null;
let rawDb = null;
let ready = null;

function init() {
  if (ready) return ready;
  ready = initSqlJs().then((sqljs) => {
    SQL = sqljs;
    rawDb = new SQL.Database();

    rawDb.run(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT,
      email TEXT,
      role TEXT,
      ssn TEXT
    )`);

    rawDb.run(`CREATE TABLE comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT,
      body TEXT
    )`);

    const seed = rawDb.prepare('INSERT INTO users (username, password, email, role, ssn) VALUES (?, ?, ?, ?, ?)');
    seed.run(['admin', 'admin123', 'admin@vulnapp.local', 'admin', '000-00-0001']);
    seed.run(['alice', 'senha123', 'alice@vulnapp.local', 'user', '000-00-0002']);
    seed.run(['bob', 'qwerty', 'bob@vulnapp.local', 'user', '000-00-0003']);
    seed.free();

    return rawDb;
  });
  return ready;
}

function toObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}


const db = {
  all(query, cb) {
    init().then((conn) => {
      try {
        const result = conn.exec(query);
        cb(null, toObjects(result));
      } catch (err) {
        cb(err);
      }
    }).catch(cb);
  },
  run(query, params, cb) {
    init().then((conn) => {
      try {
        const stmt = conn.prepare(query);
        stmt.run(params || []);
        stmt.free();
        if (cb) cb(null);
      } catch (err) {
        if (cb) cb(err);
      }
    }).catch((err) => { if (cb) cb(err); });
  },
  ready: init
};

module.exports = db;
