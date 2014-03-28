var app = require('cantina')
  , async = require('async')
  , _ = require('underscore')
  , relations = require('relations');

require('cantina-redis');

relations.use(relations.stores.redis, {
  client: app.redis,
  prefix: app.redisKey('relations')
});

app.permissions = {

  define: function (ctx, roles) {
    relations.define.apply(relations, arguments);

    app.permissions[ctx] = {

      grant: function (role, args, cb) {
        var user, object;
        if (typeof args == 'string') {
          user = args;
          object = null;
        }
        else if (args.user) {
          user = args.user.id ? args.user.id : args.user;
          object = args.object ? (args.object.id ? args.object.id : args.object) : null;
        }
        else {
          user = args.id;
          object = null;
        }
        relations[ctx](':user is a :role' + (object ? ' of :object' : ''), {
          user: user,
          role: role,
          object: object
        }, function (err) {
          if (err) return cb(err);
          app.hook('permissions:grant').run({object: object, user: user, context: ctx, role: role}, cb);
        });
      },

      revoke: function (role, args, cb) {
        var user, object;
        if (typeof args == 'string') {
          user = args;
          object = null;
        }
        else if (args.user) {
          user = args.user.id ? args.user.id : args.user;
          object = args.object ? (args.object.id ? args.object.id : args.object) : null;
        }
        else {
          user = args.id;
          object = null;
        }
        relations[ctx](':user is not a :role' + (object ? ' of :object' : ''), {
          user: user,
          role: role,
          object: object
        }, function (err) {
          if (err) return cb(err);
          app.hook('permissions:revoke').run({object: object, user: user, context: ctx, role: role}, cb);
        });
      },

      hasRole: function (role, args, cb) {
        var user, object;
        if (typeof args == 'string') {
          user = args;
          object = null;
        }
        else if (args.user) {
          user = args.user.id ? args.user.id : args.user;
          object = args.object ? (args.object.id ? args.object.id : args.object) : null;
        }
        else {
          user = args.id;
          object = null;
        }
        user = user.id ? user.id : user;
        relations[ctx]('Is :user a :role' + (object ? ' of :object?' : '?'), {object: object, user: user, role: role}, cb);
      },

      can: function (verb, args, cb) {
        var user, object;
        if (typeof args == 'string') {
          user = args;
          object = null;
        }
        else if (args.user) {
          user = args.user.id ? args.user.id : args.user;
          object = args.object ? (args.object.id ? args.object.id : args.object) : null;
        }
        else {
          user = args.id;
          object = null;
        }
        relations[ctx]('Can :user :verb' + (object ? ' to :object?' : '?'), {user: user, verb: verb, object: object}, cb);
      },

      any: function (verbs, args, cb) {
        async.map(verbs, function (verb, next) {
          app.permissions[ctx].can(verb, args, next);
        }, function (err, results) {
          if (err) return cb(err);
          return cb(null, results.some(function (result) {
            return !!result;
          }));
        });
      },

      all: function (verbs, args, cb) {
        async.map(verbs, function (verb, next) {
          app.permissions[ctx].can(verb, args, next);
        }, function (err, results) {
          if (err) return cb(err);
          return cb(null, results.every(function (result) {
            return !!result;
          }));
        });
      },

      whoIs: function (role, object, cb) {
        object = object.id ? object.id : object;
        relations[ctx]('Who is the :role of :object?', {role: role, object: object}, cb);
      },

      whoCan: function (verb, object, cb) {
        object = object.id ? object.id : object;
        relations[ctx]('Who can :verb to :object?', {verb: verb, object: object}, cb);
      },

      whatIs: function (user, role, cb) {
        user = user.id ? user.id : user;
        relations[ctx]('What is :user the :role of?', {user: user, role: role}, cb);
      },

      whatCan: function (user, verb, cb) {
        user = user.id ? user.id : user;
        relations[ctx]('What can :user :verb to?', {user: user, verb: verb}, cb);
      },

      whatActions: function (user, object, cb) {
        user = user.id ? user.id : user;
        object = object.id ? object.id : object;
        relations[ctx]('What actions can :user do with :object', {user: user, object: object}, cb);
      }
    }
  }
};