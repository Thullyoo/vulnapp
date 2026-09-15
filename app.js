const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const path = require('path');
const fs = require('fs');
const dns = require('dns');
const net = require('net');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = 'supersecret123';
const ADMIN_API_KEY = 'sk_live_51Hc9F2KZ9Xh3fake_key_do_not_use';
const DB_PASSWORD = 'P@ssw0rd_admin_2019';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieSession({
  name: 'session',
  keys: ['chave-fraca-123'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

app.get('/', (req, res) => {
  res.render('index', { user: req.session.user || null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).send(`Erro no banco: ${err.message}<br><pre>${err.stack}</pre>`);
    }
    if (rows && rows.length > 0) {
      req.session.user = rows[0];
      const token = jwt.sign({ id: rows[0].id, role: rows[0].role }, JWT_SECRET);
      res.cookie('token', token);
      return res.redirect('/profile/' + rows[0].id);
    }
    res.render('login', { error: 'Usuario ou senha invalidos' });
  });
});

app.get('/login', (req, res) => res.render('login', { error: null }));

app.get('/profile/:id', (req, res) => {
  const id = req.params.id;
  db.all(`SELECT id, username, email, role, ssn FROM users WHERE id = ${id}`, (err, rows) => {
    if (err || !rows || rows.length === 0) return res.status(404).send('Usuario nao encontrado');
    res.render('profile', { profile: rows[0], sessionUser: req.session.user || null });
  });
});

app.get('/search', (req, res) => {
  const q = req.query.q || '';
  res.render('search', { query: q, user: req.session.user || null });
});

app.post('/comments', (req, res) => {
  const { author, body } = req.body;
  db.run('INSERT INTO comments (author, body) VALUES (?, ?)', [author, body], () => {
    res.redirect('/comments');
  });
});
app.get('/comments', (req, res) => {
  db.all('SELECT * FROM comments ORDER BY id DESC', (err, rows) => {
    res.render('comments', { comments: rows || [], user: req.session.user || null });
  });
});

app.get('/ping', (req, res) => {
  const host = (req.query.host || '').trim();
  if (!host) {
    return res.render('ping', { host: '', output: null, user: req.session.user || null });
  }

  dns.lookup(host, (dnsErr, address) => {
    if (dnsErr) {
      return res.render('ping', {
        host,
        output: `Falha ao resolver "${host}": ${dnsErr.code || dnsErr.message}`,
        user: req.session.user || null
      });
    }

    const socket = new net.Socket();
    const start = Date.now();
    socket.setTimeout(1500);

    const finish = (line) => {
      socket.destroy();
      res.render('ping', {
        host,
        output: `Endereco resolvido: ${address}\n${line}`,
        user: req.session.user || null
      });
    };

    socket.connect(80, address, () => finish(`Porta 80 respondeu em ${Date.now() - start}ms`));
    socket.on('timeout', () => finish('Sem resposta na porta 80 (timeout de 1.5s)'));
    socket.on('error', (err) => finish(`Sem resposta na porta 80 (${err.code})`));
  });
});

app.get('/download', (req, res) => {
  const file = req.query.file || 'welcome.txt';
  const filePath = path.join(__dirname, 'files', file);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(404).send('Arquivo nao encontrado: ' + err.message);
    res.type('text/plain').send(data);
  });
});

const SAFE_EXPR = /^[0-9+\-*/().\s]+$/;

app.get('/calc', (req, res) => {
  const expr = req.query.expr;
  if (!expr) {
    return res.render('calc', { expr: '', result: null, error: null, user: req.session.user || null });
  }
  if (!SAFE_EXPR.test(expr)) {
    return res.render('calc', {
      expr,
      result: null,
      error: 'Use apenas numeros e os operadores + - * / ( )',
      user: req.session.user || null
    });
  }
  try {
    const result = eval(expr);
    res.render('calc', { expr, result, error: null, user: req.session.user || null });
  } catch (e) {
    res.render('calc', { expr, result: null, error: 'Expressao invalida: ' + e.message, user: req.session.user || null });
  }
});

app.post('/import', (req, res) => {
  const target = {};
  _.merge(target, req.body);
  res.json({ status: 'importado', data: target });
});

app.get('/debug/env', (req, res) => {
  res.json({
    nodeEnv: 'production',
    jwtSecret: JWT_SECRET,
    adminApiKey: ADMIN_API_KEY,
    dbPassword: DB_PASSWORD
  });
});

app.use((err, req, res, next) => {
  res.status(500).send(`<h1>Erro interno</h1><pre>${err.stack}</pre>`);
});

db.ready().then(() => {
  app.listen(PORT, () => {
    console.log(`VulnApp rodando na porta ${PORT} (uso academico - NAO expor publicamente)`);
  });
}).catch((err) => {
  console.error('Falha ao inicializar o banco em memoria:', err);
  process.exit(1);
});
