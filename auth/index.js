var app = require('cantina')
  , _ = require('underscore')
  , async = require('async')
  , bcrypt = require('bcrypt');

app.serializeUser = function (user, cb) {
  cb(null, user.id);
};

app.deserializeUser = function (id, cb) {
  app.collections.users.load(id, cb);
};

require('./third-party');
require('cantina-redis');
require('cantina-session');
require('cantina-auth');

app.auth = {};

app.auth.logIn = function (user, req, res, next) {
  req.logIn(user, function (err){
    if (err) return next(err);
    app.hook('user:logIn').run(user, req.session, function (err) {
      if (err) return app.emit('error', err);
      app.redis.SADD(app.redisKey('sessions', user.id), req.sessionID, next);
    });
  });
};


app.auth.setPassword = function (user, newPass, cb) {
  var rounds = app.conf.get('auth:rounds') || 12;
  bcrypt.hash(newPass, rounds, function (err, hash) {
    if (err) return cb(err);
    user.auth = hash;
    cb(null, hash);
  });
};

app.auth.checkPassword = function (user, pass, cb) {
  bcrypt.compare(pass, user.auth, cb);
};

app.auth.killAllSessions = function (user, cb) {
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

app.auth.killSession = function (user, session_id, cb) {
  app.sessions.destroy(session_id, function (err) {
    if (err) return cb(err);
    app.redis.SREM(app.redisKey('sessions', user.id), session_id, cb);
  });
};

app.auth.logOut = function (req, cb) {
  var user = req.user;
  if (!user) {
    app.log.warn('Logout: no user');
    return cb();
  }
  req.logOut();
  app.hook('user:logOut').run(user, req.session, function (err) {
    if (err) return app.emit('error', err);
    app.auth.killSession(user, req.sessionID, cb);
  });
};

app.hook('model:afterDestroy:users').add(function (user, done) {
  app.auth.killAllSessions(user, done);
});

app.hook('model:afterSave:users').add(function (user, done) {
  if (app.conf.get('app:users:authenticate:allowedStatus').indexOf(user.status) < 0) {
    app.auth.killAllSessions(user, done);
  }
  else {
    done();
  }
});