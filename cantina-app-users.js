var app = require('cantina')
  , async = require('async')
  , bcrypt = require('bcrypt');

require('cantina-models-mongo');
require('cantina-models-schemas');

// Default conf
app.conf.add({
  app: {
    users: {
      admin: {
        status: 'enabled',
        attributes: {
          name: {
            first: 'Web',
            last:  'Team'
          },
          username: 'admin',
          email: 'dev@terraeclipse.com',
          password: 'admin'
        }
      },
      authenticate: {
        status: ['active']
      }
    }
  }
});
var conf = app.conf.get('app:users');

app.loadSchemas('schemas', __dirname);
require('./auth');
require('./emails');

app.hook('start').add(function (done) {
  app.createMongoCollection('users', app.schemas.user.getOptions({
    /**
     * When collection is initialized, we ensure that the app does not continue --
     * because `done` is not called -- until:
     * 1) ensure necessary indexes have been created, and
     * 2) unless disabled, ensure the default admin user has been created
     */
    init: function (collection) {
      var tasks = [];
      app.schemas.user.indexes.mongo.forEach(function (idx) {
        // An index could be an array containing an optional options hash as the second argument
        tasks.push(function (next) {
          collection.ensureIndex.apply(collection, (Array.isArray(idx) ? idx : [idx]).concat(next));
        });
      });
      if (conf.admin.status !== 'disabled') {
        tasks.push(function (next) {
          var defaultAdmin = conf.admin.attributes;
          collection.findOne({ email: defaultAdmin.email }, function (err, user) {
            if (err) return next(err);
            if (user) return next();
            user = collection.create(defaultAdmin);
            app.users.setPassword(user, user.password, function (err) {
              if (err) return next(err);
              delete user.password;
              collection.save(user, next);
            });
          });
        });
      }
      if (tasks.length === 0) done();
      else async.series(tasks, done);
    }
  }));
});


app.users = {

  findByAuth: function (email, pass, cb) {
    app.collections.users.findOne({email_lc: email}, function (err, user) {
      if (err) return cb(err);
      if (user) {
        app.users.checkPassword(user, pass, function (err, valid) {
          if (err) return cb(err);
          if (valid && conf.authenticate.status.indexOf(user.status) >= 0) {
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
