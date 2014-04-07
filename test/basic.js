describe('basic', function (){

  var app
    , obj = { name: { first: 'Jean-Luc', last: 'Picard' }, username: 'captain', email: 'jlp@enterprise.com', id: idgen() };

  function assertModel (actual, expected) {
    Object.keys(expected).forEach(function (prop) {
      if (prop === '_id') {
        assert.ok(expected[prop].equal(actual[prop]));
      }
      else if (expected[prop] === Object(expected[prop])) {
        assert.deepEqual(actual[prop], expected[prop]);
      }
      else {
        assert.strictEqual(actual[prop], expected[prop]);
      }
    });
  }

  before(function (done) {
    app = require('cantina');
    app.boot(function(err) {
      app.conf.set('mongo:db', 'cantina-app-users-test-' + idgen());
      require('../');
      if (err) return done(err);
      app.start(done);
    });
  });

  after(function (done) {
    app.mongo.dropDatabase(function () {
      app.destroy(done);
    });
  });

  it('connects', function (done) {
    assert(app.collections.users);
    done();
  });

  it('works', function (done) {
    app.collections.users.create(obj, function (err, user) {
      assert.ifError(err);
      assert(user);
      assertModel(user, obj);
      done();
    });
  });

  it('supports native findOne', function (done) {
    app.collections.users.findOne({ first_name: obj.first_name }, { last_name: 0 }, function (err, entity) {
      assert.ifError(err);
      assert(entity);
      assert.strictEqual(entity.id, obj.id);
      assert.strictEqual(entity.first_name, obj.first_name);
      assert.strictEqual(entity.last_name, undefined);
      done();
    });
  });

  it('supports native find', function (done) {
    app.collections.users.find().toArray(function (err, results) {
      assert.ifError(err);
      assert(results);
      assert.equal(results.length, 1);
      assertModel(results[0], obj);
      done();
    });
  });
});
