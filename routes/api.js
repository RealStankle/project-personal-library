'use strict';

const mongoose = require('mongoose');
const Book = require('../models/book.model');

module.exports = function (app) {
  mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });

  app
    .route('/api/books')
    .get(async function (_, res) {
      const books = await Book.find({}, { comments: 0, __v: 0 });

      res.status(200).json(books);
    })

    .post(async function (req, res) {
      let bookTitle = req.body.title;

      try {
        const { _id, title } = await Book.create({ title: bookTitle });

        res.status(201).json({ _id, title });
      } catch {
        res.send('missing required field title');
      }
    })

    .delete(async function (_, res) {
      await Book.deleteMany({});

      res.send('complete delete successful');
    });

  app
    .route('/api/books/:id')
    .get(async function (req, res) {
      let bookid = req.params.id;

      try {
        const book = await Book.findById(bookid, { commentcount: 0, __v: 0 });

        if (!book) {
          throw new Error();
        }

        res.status(200).json(book);
      } catch {
        res.send('no book exists');
      }
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (!comment) {
        return res.send('missing required field comment');
      }

      try {
        const book = await Book.findByIdAndUpdate(
          bookid,
          {
            $push: {
              comments: comment,
            },
            $inc: {
              commentcount: 1,
            },
          },
          {
            new: true,
            select: {
              commentcount: 0,
              __v: 0,
            },
          }
        );

        if (!book) {
          throw new Error();
        }

        res.status(200).json(book);
      } catch (error) {
        res.send('no book exists');
      }
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;

      try {
        const book = await Book.findByIdAndDelete(bookid);

        if (!book) {
          throw new Error();
        }

        res.status(200).send('delete successful');
      } catch {
        res.send('no book exists');
      }
    });
};
