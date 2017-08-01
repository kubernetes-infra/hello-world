/* eslint no-console: 0, no-unused-vars: 0 */

const express = require('express');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');

const statics = express.static;
const app = express();

app.set('x-powered-by', false);
app.set('trust proxy', 1);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/static', statics(`${__dirname}/static`));

module.exports.nunjucks = nunjucks.configure('views', {
  autoescape: true,
  express: app,
  noCache: process.env.NODE_ENV !== 'production',
});

app.get('/favicon.ico', (req, res) => {
  res.set('Content-Type', 'image/x-icon');
  res.end();
});

app.use('/', require('./controllers/post.js'));

if (!module.parent) {
  // eslint-disable-next-line no-console
  app.listen(8080, () => console.log('Example app listening on port 8080!'));
}

module.exports = app;

process.on('SIGINT', process.exit.bind(process, 1));
