cantina-app-users
=================

Provides a solid foundation for users in a cantina application. Includes the
user model, permissions, blah blah blah.


Table of Contents
-----------------

- [Usage](#usage)
- [Permissions](#permissions)
  - [Example](#example)
  - [Usage](#usage)
- [API Reference](#api-reference)
    - [`app.permissions`](#apppermissions)
      - [`app.permissions.define(context, roles)`](#apppermissionsdefinecontext-roles)
      - [`app.permissions[context].grant(role, args, cb)`](#apppermissionscontextgrantrole-args-cb)
      - [`app.permissions[context].revoke(role, args, cb)`](#apppermissionscontextrevokerole-args-cb)
      - [`app.permissions[context].hasRole(role, args, cb)`](#apppermissionscontexthasrolerole-args-cb)
      - [`app.permissions[context].can(verb, args, cb)`](#apppermissionscontextcanverb-args-cb)
      - [`app.permissions[context].any(verbs, args, cb)`](#apppermissionscontextanyverbs-args-cb)
      - [`app.permissions[context].all(verbs, args, cb)`](#apppermissionscontextallverbs-args-cb)
      - [`app.permissions[context].whoIs(role, object, cb)`](#apppermissionscontextwhoisrole-object-cb)
      - [`app.permissions[context].whoCan(verb, object, cb)`](#apppermissionscontextwhocanverb-object-cb)
      - [`app.permissions[context].whatIs(user, role, cb)`](#apppermissionscontextwhatisuser-role-cb)
      - [`app.permissions[context].whatCan(user, verb, cb)`](#apppermissionscontextwhatcanuser-verb-cb)
      - [`app.permissions[context].whatActions(user, object, cb)`](#apppermissionscontextwhatactionsuser-object-cb)
    - [`req.access(context, verb, cb)`](#reqaccesscontext-verb-cb)

Usage
-----

[Generally describe how to use the user system, what parts can be overridden, etc.]

Permissions
-----------

Utilizes [node-relations](https://github.com/carlos8f/node-relations)
for permissions stored in redis.

### Example

[Quick copy-paste-type example of what this looks like in action]


### Usage

[Describe in more detail how to use the plugin]


API Reference
-------------

### `app.permissions`

Namespace for permission-related APIs.

#### `app.permissions.define(context, roles)`

Proxies relations to create a context, which contains a list of roles which
map to actions.
  - `context`: A name for the context
  - `roles`: A hash of roles and verbs

```js
app.permissions.define('event', {
  author: ['read', 'edit', 'delete'],
  attendee: ['read'],
  admin: ['administrate']
});
```

#### `app.permissions[context].grant(role, args, cb)`

Grants a relations role to the user.
  - `role`: The role to grant
  - `args`: may be a user model, a user id, or a hash of:
    - `user`: The user model or id to grant the role to
    - `object`: (optional) The object model or id that the role relates to
  - `cb`: The callback

Runs the [stact-hook](https://github.com/cpsubrian/node-stact-hooks)
`permissions:grant(options, done)` so other plugins may react to the event.

```js
app.permissions.event.grant('author', {
  user: userModel,
  object: eventModel
}, function (err) {
  if (err) return app.emit('error', err);
);

app.permissions.event.grant('admin', userModel, function (err) {
  if (err) return app.emit('error', err);
);
```

#### `app.permissions[context].revoke(role, args, cb)`

Revokes a relations role from the user.
  - `role`: The role to grant
  - `args`: may be a user model, a user id, or a hash of:
    - `user`: The user model or id to grant the role to
    - `object`: (optional) The object model or id that the role relates to
  - `cb`: The callback

Runs the [stact-hook](https://github.com/cpsubrian/node-stact-hooks)
`permissions:revoke(options, done)` so other plugins may react to the event.

```js
app.permissions.event.revoke('author', {
  user: userModel,
  object: eventModel
}, function (err) {
  if (err) return app.emit('error', err);
);

app.permissions.event.revoke('admin', userModel, function (err) {
  if (err) return app.emit('error', err);
);
```

#### `app.permissions[context].hasRole(role, args, cb)`

Checks whether a user has a role.
  - `role`: The role to check for
  - `args`: may be a user model, a user id, or a hash of:
    - `user`: The user model or id to grant the role to
    - `object`: (optional) The object model or id that the role relates to
  - `cb`: The callback

```js
app.permissions.event.hasRole('author', {
  user: userModel,
  object: eventModel
}, function (err, hasRole) {
  if (err) return app.emit('error', err);
  if (hasRole) {
    // do something
  }
);

app.permissions.event.hasRole('admin', userModel, function (err, hasRole) {
  if (err) return app.emit('error', err);
  if (hasRole) {
    // do something
  }
);
```

#### `app.permissions[context].can(verb, args, cb)`

Checks whether a user can perform an action.
  - `verb`: The action to check for
  - `args`: may be a user model, a user id, or a hash of:
    - `user`: The user model or id to grant the role to
    - `object`: (optional) The object model or id that the role relates to
  - `cb`: The callback

```js
app.permissions.event.can('edit', {
  user: userModel,
  object: eventModel
}, function (err, hasAccess) {
  if (err) return app.emit('error', err);
  if (hasAccess) {
    // do something
  }
);

app.permissions.event.can('administrate', userModel, function (err, hasAccess) {
  if (err) return app.emit('error', err);
  if (hasAccess) {
    // do something
  }
);
```

#### `app.permissions[context].any(verbs, args, cb)`

Checks whether a user can perform **at least one** of an array of actions
  - `verbs`: an array of actions to check for
  - `args`: may be a user model, a user id, or a hash of:
    - `user`: The user model or id to grant the role to
    - `object`: (optional) The object model or id that the role relates to
  - `cb`: The callback

```js
app.permissions.event.any(['delete', 'edit'], {
    user: 'erin',
    object: 'doc1'
  }, function (err, hasAnyAccess) {
  if (err) return app.emit('error', err);
  if (hasAnyAccess) {
    // do something
  }
);
```

#### `app.permissions[context].all(verbs, args,  cb)`

Checks whether a user can perform **all** of an array of actions.
  - `verbs`: an array of actions to check for
  - `args`: may be a user model, a user id, or a hash of:
    - `user`: The user model or id to grant the role to
    - `object`: (optional) The object model or id that the role relates to
  - `cb`: The callback

```js
app.permissions.event.all(['delete', 'edit' ], {
    user: 'erin',
    object: 'doc1'
  }, function (err, hasAllAccess) {
  if (err) return app.emit('error', err);
  if (hasAllAccess) {
    // do something
  }
);
```

#### `app.permissions[context].whoCan(verb, object, cb)`

Returns an array of user ids who can perform an action on an object.
  - `verb`: The verb to check for
  - `object`: The object model or id that the query relates to
  - `cb`: The callback

```js
app.permissions.event.whoCan('read', eventModel, function (err, userIds) {
  if (err) return app.emit('error', err);

  // do something with userIds
);
```


#### `app.permissions[context].whoIs(role, object, cb)`

Returns an array of user ids who have a role over an object.
  - `role`: The role to check for
  - `object`: The object model or id that the query relates to
  - `cb`: The callback

```js
app.permissions.event.whoIs('author', eventModel, function (err, userIds) {
  if (err) return app.emit('error', err);

  // do something with userIds
);
```

#### `app.permissions[context].whatCan(user, verb, cb)`

Returns an array of object ids on which a user can perform an action.
  - `user`: The user model or id to check access for
  - `verb`: The verb to check for
  - `cb`: The callback

```js
app.permissions.event.whatCan(userModel, 'edit', function (err, objectIds) {
  if (err) return app.emit('error', err);

  // do something with objectIds
);
```


#### `app.permissions[context].whatIs(user, role, cb)`

Returns an array of object ids on which a user has a role
  - `user`: The user model or id to check access for
  - `role`: The role to check for
  - `cb`: The callback

```js
app.permissions.event.whatIs(userModel, 'author', function (err, objectIds) {
  if (err) return app.emit('error', err);

  // do something with objectIds
);
```

#### `app.permissions[context].whatActions(user, object, cb)`

Returns an array of verbs a user can perform on an object.
  - `user`: The user model or id to check access for
  - `object`: The object model or id that the query relates to
  - `cb`: The callback

```js
app.permissions.event.whatActions(userModel, eventModel, function (err, verbs) {
  if (err) return app.emit('error', err);

  // do something with verbs
);
```

### `req.access(context, verb, cb)`

Middleware providing convenience for request access queries.
  - `context`: The relations context for the query
  - `verb`: The action to query for
  - `cb`: The callback

`req.user` and `req[context]` must be present to use this method.

```js
req.access('event', 'edit', function (err, canEdit) {
  if (err) return app.emit('error', err);

  if (canEdit) {
    // do something
  }
);
```


- - -

#### Developed by [TerraEclipse](https://github.com/TerraEclipse)

Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Santa Cruz, CA and Washington, D.C.
