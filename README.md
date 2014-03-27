cantina-app-users
=================

Exposes [node-relations](https://github.com/carlos8f/node-relations) as `app.relations`.
Permissions are stored in redis. Also, provides a thin wrapper around relations
with an options-hash syntax as an alternative to natural language arguments.

Table of Contents
-----------------

[This would be optional, but encouraged when there are > 3 sections]

- [Example](#example)
- [Usage](#usage)
- [API Reference](#api-reference)
    - [`app.permissions.define(context, roles)`](#apppermissionsdefinecontext-roles)
    - [`app.permissions.grant(options, cb)`](#apppermissionsgrantoptions-cb)
    - [`app.permissions.revoke(options, cb)`](#apppermissionsrevokeoptions-cb)
    - [`app.permissions.access(options, cb)`](#apppermissionsaccessoptions-cb)
    - [`app.permissions.accessAny(optionsArray, cb)`](#apppermissionsaccessanyoptionsarray-cb)
    - [`app.permissions.accessAll(optionsArray, cb)`](#apppermissionsaccessalloptionsarray-cb)
    - [`app.permissions.who(options, cb)`](#apppermissionswhooptions-cb)
    - [`app.permissions.what(options, cb)`](#apppermissionswhatoptions-cb)
    - [`app.permissions.actions(options, cb)`](#apppermissionsactionsoptions-cb)

Example
-------

[Quick copy-paste-type example of what this looks like in action]


Usage
------

[Describe in more detail how to use the plugin]


API Reference
-------------

#### `app.permissions.define(context, roles)`

Proxies relations to create a context, which contains a list of roles which
map to actions.
  - `context`: A name for the context
  - `roles`: A hash of roles and verbs

```js
app.permissions.define('events', {
  author: ['read', 'edit', 'delete'],
  attendee: ['read']
});
```

-

#### `app.permissions.grant(options, cb)`

Grants a relations role to the user.
  - `options`: a hash of options that must contain:
    - `context`: The relations context name to query
    - `role`: The role to grant
    - `user`: The user model or id to grant the role to
    - `object`: (optional) The object model or id that the role relates to
  - `cb`: The callback

Runs the [stact-hook](https://github.com/cpsubrian/node-stact-hooks)
`permissions:grant(options, done)` so other plugins may react to the event.

```js
app.permissions.grant({
  context: 'events'
  user: userModel,
  role: 'author'
  object: eventModel
}, function (err) {
  if (err) return app.emit('error', err);
);
```

-

#### `app.permissions.revoke(options, cb)`

Revokes a relations role from the user.
  - `options`: a hash of options that must contain:
    - `context`: The relations context name to query
    - `role`: The role to revoke
    - `user`: The user model or id to grant the role to
    - `object`: (optional) The object model or id that the role relates to
  - `cb`: The callback

Runs the [stact-hook](https://github.com/cpsubrian/node-stact-hooks)
`permissions:revoke(options, done)` so other plugins may react to the event.

```js
app.permissions.revoke({
  context: 'events'
  user: userModel,
  role: 'author'
  object: eventModel
}, function (err) {
  if (err) return app.emit('error', err);
);
```

-

#### `app.permissions.access(options, cb)`

Checks whether a user can perform an action or has a role.
  - `options`: a hash of options that must contain:
    - `context`: The relations context name to query
    - `role`: (optional) The role to check for
    - `verb`: (optional) The verb to check for
    - `user`: The user model or id to check access for
    - `object`: (optional) The object model or id that the query relates to
  - `cb`: The callback

Your query must contain one of `role` or `verb`, but not both.

```js
app.permissions.access({
  context: 'events'
  user: userModel,
  role: 'author'
  object: eventModel
}, function (err, hasRole) {
  if (err) return app.emit('error', err);
  if (hasRole) {
    // do something
  }
);

app.permissions.access({
  context: 'events'
  user: userModel,
  verb: 'edit'
  object: eventModel
}, function (err, hasAccess) {
  if (err) return app.emit('error', err);
  if (hasAccess) {
    // do something
  }
);
```

-

#### `app.permissions.accessAny(optionsArray, cb)`

Checks whether a user can perform **at least one** of an array of access
queries.
  - `optionsArray`: an array of options hashes fitting the parameters for
  `app.permissions.access`
  - `cb`: The callback

```js
app.permissions.accessAny([
  {
    context: 'events'
    user: userModel,
    verb: 'edit'
    object: eventModel
  },
  {
    context: 'events'
    user: userModel,
    verb: 'delete'
    object: eventModel
  }
], function (err, hasAnyAccess) {
  if (err) return app.emit('error', err);
  if (hasAnyAccess) {
    // do something
  }
);
```

-

#### `app.permissions.accessAll(optionsArray, cb)`

Checks whether a user can perform **all** of an array of access queries.
  - `optionsArray`: an array of options hashes fitting the parameters for
  `app.permissions.access`
  - `cb`: The callback

```js
app.permissions.accessAll([
  {
    context: 'events'
    user: userModel,
    verb: 'edit'
    object: eventModel
  },
  {
    context: 'events'
    user: userModel,
    verb: 'delete'
    object: eventModel
  }
], function (err, hasAllAccess) {
  if (err) return app.emit('error', err);
  if (hasAllAccess) {
    // do something
  }
);
```

-

#### `app.permissions.who(options, cb)`

Returns an array of user ids who can perform an action or have a role on an
object.
  - `options`: a hash of options that must contain:
    - `context`: The relations context name to query
    - `role`: (optional) The role to check for
    - `verb`: (optional) The verb to check for
    - `object`: The object model or id that the query relates to
  - `cb`: The callback

Your query must contain one of `role` or `verb`, but not both.

```js
app.permissions.who({
  context: 'events'
  role: 'author'
  object: eventModel
}, function (err, userIds) {
  if (err) return app.emit('error', err);

  // do something with userIds
);

app.permissions.who({
  context: 'events'
  verb: 'read'
  object: eventModel
}, function (err, userIds) {
  if (err) return app.emit('error', err);

  // do something with userIds
);
```

-

#### `app.permissions.what(options, cb)`

Returns an array of object ids on which a user can perform an action or has a
role.
  - `options`: a hash of options that must contain:
    - `context`: The relations context name to query
    - `role`: (optional) The role to check for
    - `verb`: (optional) The verb to check for
    - `user`: The user model or id to check access for
  - `cb`: The callback

Your query must contain one of `role` or `verb`, but not both.

```js
app.permissions.what({
  context: 'events'
  user: userModel,
  role: 'author'
}, function (err, objectIds) {
  if (err) return app.emit('error', err);

  // do something with objectIds
);
```

-

#### `app.permissions.actions(options, cb)`

Returns an array of verbs a user can perform on an object.
  - `options`: a hash of options that must contain:
    - `context`: The relations context name to query
    - `user`: The user model or id to check access for
    - `object`: The object model or id that the query relates to
  - `cb`: The callback

```js
app.permissions.actions({
  context: 'events'
  user: userModel,
  objects: eventModel
}, function (err, verbs) {
  if (err) return app.emit('error', err);

  // do something with verbs
);
```

- - -

#### Developed by [TerraEclipse](https://github.com/TerraEclipse)

Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Santa Cruz, CA and Washington, D.C.
