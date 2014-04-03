describe('Authentication', function () {
  var app
    , http = require('http')
    , user = {
      id: 'erin'
    };

  before(function (done) {
    app = require('cantina');
    app.boot(function (err) {
      if (err) return done(err);

      require('../');
      require('cantina-web');
      app.silence();

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

  it('should create a session upon login', function (done) {
    http.get('http://localhost:3000/test-login', function () {
      var key = app.redisKey('sessions', user.id);
      app.redis.SMEMBERS(key, function (err, members) {
        assert.ifError(err);
        assert(members.length);
        done();
      });
    }).on('error', function (err) {
      assert.ifError(err);
    });
  });

  it('should delete all sessions upon logout', function (done) {
    http.get('http://localhost:3000/test-logout', function () {
      var key = app.redisKey('sessions', user.id);
      app.redis.SMEMBERS(key, function (err, members) {
        assert.ifError(err);
        assert(!members.length);
        done();
      });
    }).on('error', function (err) {
        assert.ifError(err);
      });
  })

});
