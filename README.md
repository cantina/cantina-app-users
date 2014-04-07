cantina-app-users
=================

Provides a solid foundation for users in a cantina application. Includes the
user model, and authentication.


Table of Contents
-----------------
- [Usage](#usage)
- [Authentication](#authentication)
  - [Example](#example)
- [API Reference](#api-reference)

Usage
-----

[Generally describe how to use the user system, what parts can be overridden, etc.]

Authentication
--------------

Provides a standard implementation of the functionality required by
cantina-auth, as well as session management.

### Example

```js
var app = require('cantina')
  , controller = module.exports = app.controller();

controller.get('/login', function (req, res, next) {
  /*
   * Parse the login request.
   * Load and verify the user
   */

   var user;
   app.auth.logIn(user, req, res, function (err) {
    if (err) return res.renderError(err);
     res.render('home');
   });
}

controller.get('/logout', function (req, res, next) {
  app.auth.logOut(req, function (err) {
    if (err) return res.renderError(err);
    res.redirect('/login');
  });
});
```

```js
app.hook('model:destroy:user', function (user, next) {

  // Kill the user's active sessions
  app.auth.killSession(user, next);
});
```

API Reference
-------------

### `app.users`

Namespace for user API

#### `app.users.findByAuth( email, password, cb )`

Load user with matching email from the database and verifies password. Returns
a sanitized user model, if match is found.

#### `app.users.authenticate( email, password, req, res, next)`

Loads the user via `findByAuth` and invokes `req.logIn`.

#### `app.users.setPassword( user, password, cb )`

Sets the auth property on the user model to be a `bcrypt` hash of the password

#### `app.users.checkPassword( user, password, cb )`

Checks the password against the user's auth property using `bcrypt.compare`

#### `app.users.sanitize( user )`

Modifies and returns the user model without the auth property

### `app.auth`

Namespace for authentication-related API

#### `app.auth.logIn( user, req, res, next )`

Invokes `req.logIn` and adds the `req.sessionID` to a set of sessionIDs for the
 user in redis.

#### `app.auth.killSession( user, cb )`

Loads the user's sessionIDs from redis and destroys each. Deletes the user's
set of sessionIDs in redis.

#### `app.auth.logOut( req, cb )`

Invokes `req.logOut` and `app.auth.killSession` for the authenticated user

### `app.serializeUser( user, cb )`

Implements user serialization for cantina-auth. Returns the user model's `id`
property.

### `app.deserializeUser( id, cb )`

Implements user deserialization for cantina-auth. Loads and returns the user
with matching `id` in `app.collections.user`.