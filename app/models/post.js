const db = require('../lib/db');
const Schema = require('../lib/db').Schema;

const postSchema = new Schema({
  user: { type: String },
  title: { type: String },
  link: { type: String },
  submitted: { type: Date, default: Date.now },
});

module.exports = {
  Post: db.model('Post', postSchema),
};
