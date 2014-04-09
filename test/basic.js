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
      if (err) return done(err);
      app.conf.set('mongo:db', 'cantina-app-users-test-' + idgen());
      require('../');
      app.silence();
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
    app.collections.users.findOne({ 'name.first': obj.name.first }, { 'name.last': 0 }, function (err, entity) {
      assert.ifError(err);
      assert(entity);
      assert.strictEqual(entity.id, obj.id);
      assert.strictEqual(entity.name.first, obj.name.first);
      assert.strictEqual(entity.name.last, undefined);
      done();
    });
  });

  it('supports native find', function (done) {
    app.collections.users.find({ 'name.first': obj.name.first }).toArray(function (err, results) {
      assert.ifError(err);
      assert(results);
      assert.equal(results.length, 1);
      assertModel(results[0], obj);
      done();
    });
  });

  it('creates the default admin user', function (done) {
    var defaultAdmin = app.conf.get('app:users:admin:attributes');
    assert.equal(defaultAdmin.email, 'dev@terraeclipse.com'); // just to be sure
    app.collections.users.findOne({ email: defaultAdmin.email }, function (err, user) {
      assert.ifError(err);
      assert(user);
      assert.strictEqual(user.email, defaultAdmin.email);
      assert.strictEqual(user.username, defaultAdmin.username);
      assert.deepEqual(user.name, defaultAdmin.name);
      done();
    });
  });
});
