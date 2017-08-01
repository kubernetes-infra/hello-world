'use strict';

const Router = require('express').Router;
const route = new Router();

route.get('/', (req, res) => {
  res.render('index.html', { req, foo: 'bar' });
});

module.exports = route;
