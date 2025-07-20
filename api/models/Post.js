const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PostSchema = new Schema({
  website: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  userID: { type: String, required: true} 
}, {
  timestamps: true,
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;
