var app = require('cantina')
  , async = require('async');

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
        allowedStatus: ['active']   //Users must have one of these statuses in order to log in
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
      // Expose schema methods
      ['sanitize', 'defaults', 'prepare', 'validate'].forEach(function (method) {
        collection[method] = app.schemas.user[method] || function noop () {};
      });
      var tasks = [];
      app.schemas.user.indexes.mongo.forEach(function (idx) {
        // An index could be an array containing an optional options hash as the second argument
        tasks.push(function (next) {
          collection._ensureIndex.apply(collection, (Array.isArray(idx) ? idx : [idx]).concat(next));
        });
      });
      if (conf.admin.status !== 'disabled') {
        tasks.push(function (next) {
          var defaultAdmin = conf.admin.attributes;
          collection._findOne({ email_lc: defaultAdmin.email.toLowerCase() }, function (err, user) {
            if (err) return next(err);
            if (user) return next();
            user = collection.create(defaultAdmin);
            app.auth.setPassword(user, user.password, function (err) {
              if (err) return next(err);
              delete user.password;
              collection.save(user, next);
            });
          });
        });
      }

      collection.findByAuth = function (email, pass, cb) {

        collection._findOne({email_lc: email}, function (err, user) {
          if (err) return cb(err);
          if (user) {
            app.auth.checkPassword(user, pass, function (err, valid) {
              if (err) return cb(err);
              if (valid && conf.authenticate.allowedStatus.indexOf(user.status) >= 0) {
                return cb(null, collection.sanitize(user));
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
      };

      if (tasks.length === 0) done();
      else async.series(tasks, done);
    }
  }));

  app.collections.users.sanitize = function (user) {
    delete user.auth;
    return user;
  };
});
