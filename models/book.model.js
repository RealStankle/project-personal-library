const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
  title: { type: String, required: true },
  commentcount: { type: Number, default: 0 },
  comments: [String],
});

module.exports = model('Book', bookSchema);
