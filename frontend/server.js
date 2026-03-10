const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(
    {
      key: fs.readFileSync('/certs/frontend.key'),
      cert: fs.readFileSync('/certs/frontend.crt'),
    },
    (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }
  ).listen(3000, '0.0.0.0', () => {
    console.log('> Ready on https://0.0.0.0:3000');
  });
});
