describe('authentication', function () {
  var app
    , user
    , pass = 'admin';

  before(function (done) {
    app = require('cantina');
    app.boot(function (err) {
      if (err) return done(err);

      app.conf.set('mongo:db', 'cantina-app-users-test-' + idgen());
      app.conf.set('redis:prefix', 'cantina-app-users-test-' + idgen());
      app.conf.set('auth-twitter', {});
      require('../');
      app.silence();
      app.start(function (err) {
        if (err) return done(err);
        var controller = app.controller();

        controller.get('/test-login', function (req, res, next) {
          app.users.authenticate(req.query.email, req.query.pass, req, res, function (err) {
            if (err) {
              console.log(err);
              res.renderStatus(500);
            }
            if (req.isAuthenticated()) {
              res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
              res.end('<body>Welcome!</body>');
            }
            else {
              console.log('Error: not authenticated');
              res.renderStatus(403);
            }
          });
        });
        controller.get('/test-logout', function (req, res) {
          req.user || (req.user = user);
          app.auth.logOut(req, function (err) {
            if (err) {
              console.log(err);
              res.renderStatus(500);
            }
            if (!req.isAuthenticated()) {
              res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
              res.end('<body>Goodbye!</body>');
            }
            else {
              console.log('Error: still authenticated');
              res.renderStatus(403);
            }
          });
        });
        app.middleware.add(controller);
        done();
      });
    });
  });

  before(function (done) {
    user = app.collections.users.create({
      email: 'dev@TerraEclipse.com',
      email_lc: 'dev@terraeclipse.com',
      username: 'admin'
    });
    done();
  });

  after(function (done) {
    app.mongo.dropDatabase(function () {
      app.destroy(done);
    });
  });

  it('should be able to set a user\'s password', function (done) {
    app.users.setPassword(user, pass, function (err) {
      assert.ifError(err);
      assert(user.auth);
      app.collections.users.save(user, function (err) {
        assert.ifError(err);
        done();
      })
    });
  });

  it('should be able to check a user\'s password', function (done) {
    app.users.checkPassword(user, pass, function (err, valid) {
      assert.ifError(err);
      assert(valid);
      app.users.checkPassword(user, 'foo', function (err, invalid) {
        assert.ifError(err);
        assert(!invalid);
        done();
      });
    });
  });

  it('should be able to load a user by email/pass', function (done) {
    app.users.findByAuth(user.email_lc, pass, function (err, foundUser) {
      assert.ifError(err);
      assert(foundUser);
      assert.equal(foundUser.id, user.id);
      assert(!foundUser.auth);
      done();
    });
  });

  it('should be able to sanitize a user model', function (done) {
    assert(user.auth);
    app.users.sanitize(user);
    assert(!user.auth);
    done();
  });

  it('should be able to authenticate a user', function (done) {
    request('http://localhost:3000/test-login?email=' + user.email_lc + '&pass=' + pass,  function (error, response) {
      assert.ifError(error);
      assert.equal(response.statusCode, 200);
      done();
    });
  })

  it('should create a session upon login', function (done) {
    var key = app.redisKey('sessions', user.id);
    app.redis.SMEMBERS(key, function (err, members) {
      assert.ifError(err);
      assert(members.length);
      done();
    });
  });

  it('should delete all sessions upon logout', function (done) {
    request.get('http://localhost:3000/test-logout',  function (error, response) {
      assert.ifError(error);
      assert.equal(response.statusCode, 200);
      var key = app.redisKey('sessions', user.id);
      app.redis.SMEMBERS(key, function (err, members) {
        assert.ifError(err);
        assert(!members.length);
        done();
      });
    })
  });

  it('extends the user schema for third party auths', function (done) {
    assert(app.schemas.user.properties.provider);
    done();
  })

});
