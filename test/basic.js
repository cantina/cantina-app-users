describe('basic', function (){

  var app
    , obj = { first_name: 'Jean-Luc', last_name: 'Picard', id: idgen() };

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
      for (var k in obj) {
        assert.strictEqual(user[k], obj[k]);
      }
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
      for (var k in obj) {
        assert.strictEqual(results[0][k], obj[k]);
      }
      done();
    });
  });
});
