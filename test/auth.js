describe('Authentication', function () {
  var app
    , user = {
      id: 'erin'
    };

  before(function (done) {
    app = require('cantina');
    app.boot(function (err) {
      if (err) return done(err);

      app.conf.set('mongo:db', 'cantina-app-users-test-' + idgen());
      app.silence();
      require('../');

      app.start(function (err) {
        if (err) return done(err);
        var controller = app.controller();

        controller.get('/test-login', function (req, res) {
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          app.auth.logIn(user, req, res, function (err) {
            assert.ifError(err);
            assert(req.isAuthenticated());
            res.end('<body>Welcome!</body>');
          });
        });
        controller.get('/test-logout', function (req, res) {
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          req.user = user;
          app.auth.logOut(req, function (err) {
            assert.ifError(err);
            assert(!req.isAuthenticated());
            res.end('<body>Goodbye!</body>');
          });
        });

        app.middleware.add(controller);
        done();
      });
    });
  });

  after(function (done) {
    app.destroy(done);
  });

  it('should create a session upon login', function (done) {
    request('http://localhost:3000/test-login', function (err) {
      assert.ifError(err);
      var key = app.redisKey('sessions', user.id);
      app.redis.SMEMBERS(key, function (err, members) {
        assert.ifError(err);
        assert(members.length);
        done();
      });
    });
  });

  it('should delete all sessions upon logout', function (done) {
    request.get('http://localhost:3000/test-logout', function (err) {
      assert.ifError(err);
      var key = app.redisKey('sessions', user.id);
      app.redis.SMEMBERS(key, function (err, members) {
        assert.ifError(err);
        assert(!members.length);
        done();
      });
    })
  })

});
