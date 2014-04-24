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
    app.collections.users._findOne({ 'name.first': obj.name.first }, { 'name.last': 0 }, function (err, entity) {
      assert.ifError(err);
      assert(entity);
      assert.strictEqual(entity.id, obj.id);
      assert.strictEqual(entity.name.first, obj.name.first);
      assert.strictEqual(entity.name.last, undefined);
      done();
    });
  });

  it('supports native find', function (done) {
    app.collections.users._find({ 'name.first': obj.name.first }).toArray(function (err, results) {
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
    app.collections.users._findOne({ email: defaultAdmin.email }, function (err, user) {
      assert.ifError(err);
      assert(user);
      assert.strictEqual(user.email, defaultAdmin.email);
      assert.strictEqual(user.username, defaultAdmin.username);
      assert.deepEqual(user.name,
        { first: defaultAdmin.name.first,
          last: defaultAdmin.name.last,
          full: defaultAdmin.name.first + ' ' + defaultAdmin.name.last,
          sortable: defaultAdmin.name.last + ', ' + defaultAdmin.name.first });
      done();
    });
  });

  it('cannot create a second user with the same email address', function (done) {
    var dupe = {
      name: obj.name,
      email: obj.email,
      username: obj.username + '2'
    };
    app.collections.users.create(dupe, function (err) {
      assert(err);
      assert.equal(err.name, 'MongoError', err.message);
      assert(err.message.match(/E11000 duplicate key error index: cantina-app-users-test-[^.]+\.users\.\$email_lc_1 /), 'Unexpected error message: ' + err.message);
      done();
    });
  });

  it('cannot create a second user with the same username', function (done) {
    var dupe = {
      name: obj.name,
      email: 'bill@pullman.name',
      username: obj.username
    };
    app.collections.users.create(dupe, function (err) {
      assert(err);
      assert.equal(err.name, 'MongoError', err.message);
      assert(err.message.match(/E11000 duplicate key error index: cantina-app-users-test-[^.]+\.users\.\$username_lc_1 /), 'Unexpected error message: ' + err.message);
      done();
    });
  });

  it('can set a default username', function (done) {
    var user = {
      name: obj.name,
      email: 'bill@pullman.name'
    };
    app.collections.users.create(user, function (err, savedUser) {
      assert.ifError(err);
      assert(savedUser.username);
      done();
    });
  });

  it('hides properties defined as private by the schema', function (done) {
    app.collections.users.load({ username: 'captain' }, function (err, user) {
      assert.ifError(err);
      assert(user);
      assert.strictEqual(user.name.first, obj.name.first);
      assert.strictEqual(user.name.last, obj.name.last);
      assert.strictEqual(user.auth, undefined);
      done();
    });
  });

  it('has schema-defined model methods', function () {
    assert.ok(typeof app.collections.users.sanitize === 'function');
    assert.ok(typeof app.collections.users.defaults === 'function');
    assert.ok(typeof app.collections.users.prepare === 'function');
    assert.ok(typeof app.collections.users.validate === 'function');
    var user = {
      name: {
        first: obj.name.first,
        last: obj.name.last
      },
      email: 'schema-test@user.name',
      auth: 'password'
    };
    assert.strictEqual(user.status, undefined);
    app.collections.users.defaults(user);
    assert(user.status);
    assert.strictEqual(user.name.full, undefined);
    app.collections.users.prepare(user);
    assert(user.name.full);
    delete user.email;
    var err = app.collections.users.validate(user);
    assert(Array.isArray(err) && err.length);
    err.every(function (e) { return assert(e instanceof Error); });
    assert(user.auth);
    app.collections.users.sanitize(user);
    assert.strictEqual(user.auth, undefined);
  });
});
