const Router = require('express').Router;
const { Post } = require('../models/post');
const { submissionsCounter } = require('../lib/metrics');

const route = new Router();
const env = process.env;

route.all('/submit', (req, res) => {
  // eslint-disable-next-line no-console
  console.log(req.method);

  if (req.method === 'POST') {
    const { user, title, link } = req.body;
    const category = 'Technology';
    const post = new Post({ user, title, link });

    post.save((err) => {
      if (err) {
        submissionsCounter.inc({ category, status: 'error' });
        res.render('submit.html', { env, req, err });
      } else {
        submissionsCounter.inc({ category, status: 'success' });
        res.redirect('/');
      }
    });
  } else {
    res.render('submit.html', { env, req });
  }
});

route.get('/', (req, res) => {
  Post.find().sort('-_id').limit(10).exec((err, posts) => {
    res.render('index.html', { env, req, posts });
  });
});

module.exports = route;
