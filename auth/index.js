var app = require('cantina')
  , _ = require('underscore')
  , async = require('async');

app.serializeUser = function (user, cb) {
  cb(null, user.id);
};

app.deserializeUser = function (id, cb) {
  app.collections.user.load(id, cb);
};

require('./third-party');
require('cantina-redis');
require('cantina-session');
require('cantina-auth');

app.auth = {};

app.auth.logIn = function (user, req, res, next) {
  req.logIn(user, function (err){
    if (err) return next(err);
    app.redis.SADD(app.redisKey('sessions', user.id), req.sessionID, next);
  });
};

app.auth.killSession = function (user, cb) {
  var key = app.redisKey('sessions', user.id ? user.id : user);
  app.redis.SMEMBERS(key, function (err, members) {
    if (err) return cb(err);
    if (members) {
      async.forEach(members, app.sessions.destroy, function (err) {
        if (err) return cb(err);
        app.redis.DEL(key, cb);
      });
    }
    else cb();
  });
};

app.auth.logOut = function (req, cb) {
  var user = req.user;
  if (!user) {
    app.log.warn('Logout: no user');
    return cb();
  }
  req.logOut();
  app.auth.killSession(user, cb);
};