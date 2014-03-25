var app = require('cantina')
  , bcrypt = require('bcrypt');

require('cantina-models-mongo');
require('cantina-models-schemas');

app.loadSchemas('schemas', __dirname);
require('./auth');
require('./emails');

app.hook('start').add(function (done) {
  app.createMongoCollection('users', app.schemas.user.getOptions({
    init: function (collection) {
      collection.ensureIndex(app.schemas.user.indexes.mongo, function (err) {
        if (err) app.emit('error', err);
      });
    }
  }));
  done();
});


app.users = {

  findByAuth: function (email, pass, cb) {
    app.collections.users.findOne({email_lc: email}, function (err, user) {
      if (err) return cb(err);
      if (user) {
        app.users.checkPassword(user, pass, function (err, valid) {
          if (err) return cb(err);
          if (valid) {
            return cb(null, app.users.sanitize(user));
          }
          else {
            cb();
          }
        });
      }
      else {
        cb();
      }
    });
  },

  authenticate: function (email, pass, req, res, next) {
    app.users.findByAuth(email, pass, function (err, user) {
      if (err) return next(err);
      if (user) {
        return app.auth.logIn(user, req, res, next);
      }
      else {
        return next(new Error('Invalid email/password combination'));
      }
    });
  },

  setPassword: function (user, newPass, cb) {
    var rounds = app.conf.get('auth:rounds') || 12;
    bcrypt.hash(newPass, rounds, function (err, hash) {
      if (err) return cb(err);
      user.auth = hash;
      cb(null, hash);
    });
  },

  checkPassword: function (user, pass, cb) {
    bcrypt.compare(pass, user.auth, cb);
  },

  sanitize: function (user) {
    delete user.auth;
    return user;
  }
};
