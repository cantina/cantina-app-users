var app = require('cantina')
  , async = require('async');

require('cantina-models-mongo');
require('cantina-models-schemas');
require('cantina-permissions');

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

      // Extend the collection with schema and additional helper methods
      app.schemas.user.attach(collection, function (err) {
        if (err) return done(err);
        collection.findByAuth = function findByAuth (email, pass, cb) {
          collection._findOne({email_lc: email.toLowerCase()}, function (err, user) {
            if (err) return cb(err);
            if (user) {
              app.auth.checkPassword(user, pass, function (err, valid) {
                if (err) return cb(err);
                if (valid && conf.authenticate.allowedStatus.indexOf(user.status) >= 0) {
                  collection.sanitize(user);
                  return cb(null, user);
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

        // Create the default admin user
        if (conf.admin.status !== 'disabled') {
          var defaultAdmin = conf.admin.attributes
            , defaultPermissions = conf.admin.permissions;
          collection._findOne({ email_lc: defaultAdmin.email.toLowerCase() }, function (err, user) {
            if (err) return done(err);
            if (user) return done();
            user = collection.create(defaultAdmin);
            app.auth.setPassword(user, user.password, function (err) {
              if (err) return done(err);
              delete user.password;
              collection.save(user, function (err) {
                if (err) return done(err);
                // Grant any default permissions
                if (!defaultPermissions) return done();
                async.each(Object.keys(defaultPermissions), function (ctx, nextCtx) {
                  if (!app.permissions[ctx]) return nextCtx(new Error('Permissions context not defined ' + ctx));
                  var permissions = Array.isArray(defaultPermissions[ctx]) ? defaultPermissions[ctx] : [defaultPermissions[ctx]];
                  async.each(permissions, function (permission, nextPermission) {
                    app.permissions[ctx].grant(permission, user.id, nextPermission);
                  }, nextCtx);
                }, done);
              });
            });
          });
        }
        else done();
      });

    }
  }));
});
