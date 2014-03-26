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

        app.middleware.get('/log-in', function (req, res) {
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          app.auth.logIn(user, req, res, function (err) {
            assert.ifError(err);
            res.end('<body>Welcome!</body>');
          });
        });
        app.middleware.get('/log-out', function (req, res) {
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          req.user = user;
          app.auth.logOut(req, function (err) {
            assert.ifError(err);
            res.end('<body>Goodbye!</body>');
          });
        });
        done();
      });
    });
  });

  it('should create a session upon login', function (done) {
    http.get('http://localhost:3000/log-in', function () {
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
    http.get('http://localhost:3000/log-out', function () {
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
