var app = require('cantina')
  , async = require('async')
, relations = require('relations');

require('cantina-redis');

relations.use(relations.stores.redis, {
  client: app.redis,
  prefix: app.redisKey('relations')
});

//Expose relations directly
app.relations = relations;

//Expose helper functions for relations functionality
app.permissions = {

  define: function () {
    return app.relations.define.apply(app.relations, arguments);
  },

  grant: function grant (options, cb) {
    if (!app.relations[options.context]) {
      return cb(new Error('Invalid context passed to app.permissions.grant()'));
    }
    var user = options.user.id ? options.user.id : options.user
      , object = options.object ? (options.object.id ? options.object.id : options.object) : null;

    app.relations[options.context](':user is a :role' + (object ? ' of :object' : ''), {
      user: user,
      role: options.role,
      object: object
    }, function (err) {
      if (err) return cb(err);
      app.hook('permissions:grant').run({object: object, user: user, context: options.context, role: options.role}, cb);
    });
  },

  revoke: function revoke (options, cb) {
    if (!app.relations[options.context]) {
      return cb(new Error('Invalid context passed to app.permissions.revoke()'));
    }
    var user = options.user.id ? options.user.id : options.user
      , object = options.object ? (options.object.id ? options.object.id : options.object) : null;

    app.relations[options.context](':user is not a :role' + (object ? ' of :object' : ''), {
      user: user,
      role: options.role,
      object: object
    }, function (err) {
      if (err) return cb(err);
      app.hook('permissions:revoke').run({object: object, user: user, context: options.context, role: options.role}, cb);
    });
  },

  access: function access (options, cb) {
    if (!app.relations[options.context]) {
      return cb(new Error('Invalid context passed to app.permissions.access()'));
    }
    var user = options.user.id ? options.user.id : options.user
      , object = options.object ? (options.object.id ? options.object.id : options.object) : null;
    if (options.role) {
      app.relations[options.context]('Is :user a :role' + (object ? ' of :object?' : '?'), {user: user, role: options.role, object: object}, cb);
    }
    else {
      app.relations[options.context]('Can :user :verb' + (object ? ' to :object?' : '?'), {user: user, verb: options.verb, object: object}, cb);
    }
  },

  _accessMulti: function (args, reduce, cb) {
    var self = this;

    async.map(args, function (options, cb) {
      self.access.apply(self, arguments);
    }, function (err, results) {
      if (err) return cb(err);
      cb(null, reduce(results));
    });
  },

  anyAccess: function (args, cb) {
    this._accessMulti(args, function (results) {
      return results.some(function (result) {
        return !!result;
      });
    }, cb);
  },

  who: function who (options, cb) {
    if (!app.relations[options.context]) {
      return cb(new Error('Invalid context passed to app.permissions.who()'));
    }
    var object = options.object ? (options.object.id ? options.object.id : options.object) : null;
    if (options.role) {
      app.relations[options.context]('Who is the :role' + (object ? ' of :object?' : '?'), {role: options.role, object: object}, cb);
    }
    else {
      app.relations[options.context]('Who can :verb' + (object ? ' to :object?' : '?'), {verb: options.verb, object: object}, cb);
    }
  },

  what: function what (options, cb) {
    if (!app.relations[options.context]) {
      return cb(new Error('Invalid context passed to app.permissions.what()'));
    }
    var user = options.user.id ? options.user.id : options.user;
    if (options.role) {
      app.relations[options.context]('What is :user the :role of?', {user: user, role: options.role}, cb);
    }
    else {
      app.relations[options.context]('What can user :verb to?', {user: user, verb: options.verb}, cb);
    }
  },

  actions: function actions (options, cb) {
    if (!app.relations[options.context]) {
      return cb(new Error('Invalid context passed to app.permissions.actions()'));
    }
    var user = options.user.id ? options.user.id : options.user
      , object = options.object ? (options.object.id ? options.object.id : options.object) : null;
    app.relations[options.context]('What actions can :user do with :object?', {user: user, object: object}, cb);
  }
};