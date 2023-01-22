const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  suite('Routing tests', function () {
    let bookId;

    suite(
      'POST /api/books with title => create book object/expect book object',
      function () {
        test('Test POST /api/books with title', function (done) {
          const bookObj = { title: 'Test Title' };

          chai
            .request(server)
            .post('/api/books')
            .send(bookObj)
            .end((_, response) => {
              assert.strictEqual(response.status, 201);
              assert.include(response.body, bookObj);
              assert.hasAllKeys(response.body, ['title', '_id']);

              bookId = response.body._id;
              done();
            });
        });

        test('Test POST /api/books with no title given', function (done) {
          chai
            .request(server)
            .post('/api/books')
            .end((_, response) => {
              assert.strictEqual(response.text, 'missing required field title');
              done();
            });
        });
      }
    );

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai
          .request(server)
          .get('/api/books')
          .end((_, response) => {
            assert.strictEqual(response.status, 200);
            assert.typeOf(response.body, 'array');
            assert.hasAllKeys(response.body[0], [
              '_id',
              'title',
              'commentcount',
            ]);
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        chai
          .request(server)
          .get(`/api/books/${bookId.slice(0, 10)}`)
          .end((_, response) => {
            assert.strictEqual(response.text, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai
          .request(server)
          .get(`/api/books/${bookId}`)
          .end((_, response) => {
            assert.strictEqual(response.status, 200);
            assert.hasAllKeys(response.body, ['_id', 'title', 'comments']);
            assert.strictEqual(response.body._id, bookId);
            done();
          });
      });
    });

    suite(
      'POST /api/books/[id] => add comment/expect book object with id',
      function () {
        test('Test POST /api/books/[id] with comment', function (done) {
          const comment = 'this is test comment';
          chai
            .request(server)
            .post(`/api/books/${bookId}`)
            .send({ comment })
            .end((_, response) => {
              assert.strictEqual(response.status, 200);
              assert.hasAllKeys(response.body, ['_id', 'title', 'comments']);
              assert.strictEqual(response.body._id, bookId);
              assert.include(response.body.comments, comment);
              done();
            });
        });

        test('Test POST /api/books/[id] without comment field', function (done) {
          chai
            .request(server)
            .post(`/api/books/${bookId}`)
            .end((_, response) => {
              assert.strictEqual(
                response.text,
                'missing required field comment'
              );
              done();
            });
        });

        test('Test POST /api/books/[id] with comment, id not in db', function (done) {
          chai
            .request(server)
            .post(`/api/books/${bookId.slice(0, 10)}`)
            .send({ comment: 'comment' })
            .end((_, response) => {
              assert.strictEqual(response.text, 'no book exists');
              done();
            });
        });
      }
    );

    suite('DELETE /api/books/[id] => delete book object id', function () {
      test('Test DELETE /api/books/[id] with valid id in db', function (done) {
        chai
          .request(server)
          .delete(`/api/books/${bookId}`)
          .end((_, response) => {
            assert.strictEqual(response.status, 200);
            assert.strictEqual(response.text, 'delete successful');
            chai
              .request(server)
              .get(`/api/books/${bookId}`)
              .end((_, response) => {
                assert.strictEqual(response.text, 'no book exists');
                done();
              });
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function (done) {
        chai
          .request(server)
          .delete(`/api/books/${bookId}`)
          .end((_, response) => {
            assert.strictEqual(response.text, 'no book exists');
            done();
          });
      });
    });
  });
});
