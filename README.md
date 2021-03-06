cantina-app-users
=================

Provides a basic, extensible user system for a
[cantina](https://github.com/cantina/cantina) application. Includes the user
model (with an extensible default schema), authentication, and default email
templates for basic user account-related emails.

Table of Contents
-----------------
- [Usage](#usage)
- [Default Schema](#default-schema)
  - [Extending](#extending)
- [Default Admin User](#default-admin-user)
  - [Configuring](#configuring)
- [Schemas](#schemas)
- [Authentication](#authentication)
  - [Example](#example)
- [Email](#email)
  - [Templates](#templates)
  - [Hooks](#hooks)
- [API Reference](#api-reference)
  - [`app.collections.users`](#appcollectionsusers)
    - [`app.collections.users.findByAuth(email, password, cb)`](#appcollectionsusersfindbyauthemail-password)
  - [`app.auth`](#appauth)
    - [`app.auth.logIn(user, req, res, next)`](#appauthloginuser-req-res-next)
    - [`app.auth.setPassword(user, password, cb)`](#appauthsetpassworduser-password-cb)
    - [`app.auth.checkPassword(user, password, cb)`](#appauthcheckpassworduser-password-cb)
    - [`app.auth.killSession(user, sessionID, cb)`](#appauthkillsessionuser-sessionid-cb)
    - [`app.auth.killAllSessions(user, cb)`](#appauthkillallsessionsuser-cb)
    - [`app.auth.logOut(req, cb)`](#appauthlogoutreq-cb)
  - [`app.serializeUser(user, cb)`](#appserializeuseruser-cb)
  - [`app.deserializeUser(id, cb)`](#appdeserializeuserid-cb)
  - [`app.verifyTwitterUser(token, tokenSecret, profile, done)`](#appverifytwitteruser-token-tokensecret-profile-done)
  - [`app.verifyFacebookUser(token, tokenSecret, profile, done)`](#appverifyfacebookuser-token-tokensecret-profile-done)

Usage
-----

Most of the provided defaults are easily overridden via configuration (`etc`) or
application hooks (`app.hook`). Default email templates can be overridden by
providing an alternative template having the same name.

Default Schema
--------------

Provides the [default user schema](schemas/user.js).

### Extending

```js
module.exports = function (app) {
  app.Schema.extend(app.schemas.user, {
    properties: {
      someprop: {
      type: 'string',
      default: '',
      required: true
      }
    }
  });
};
```

Default Admin User
------------------

Provides the default admin user, Web Team <dev@terraeclipse.com>, with password "admin".

### Configuring

```yaml
# In etc/app/users.yml
admin:
  attributes:
    username: webteam
    password: ryd9ebyz
```

Schemas
-------

Provides schemas for [cantina-models](https://github.com/cantina/cantina-models)

See [cantina-models-schemas](https://github.com/cantina/cantina-models-schemas)
for details.

Authentication
--------------

Provides a standard implementation of the functionality required by
[cantina-auth](https://github.com/cantina/cantina-auth), as well as session management.

### Example

```js
module.exports = function (app) {
  var controller = app.controller();

  controller.post('/login', function (req, res, next) {
    if (!req.body) {
        return next(new Error('Invalid post data'));
      }
      if (!req.body.email || !req.body.pass) {
        res.formError('login', 'Email and password are both required.');
        return next();
      }

      app.collections.users.findByAuth(req.body.email.trim(), req.body.pass, function (err) {
        if (err) {
          res.formError('login', err.message);
          return next();
        }
        res.redirect('/');
      });
  }

  controller.post('/logout', function (req, res, next) {
    app.auth.logOut(req, function (err) {
      if (err) return res.renderError(err);
      res.redirect('/login');
    });
  });

  return controller;
};
```

```js
module.exports = function (app) {
  app.hook('model:destroy:user', function (user, next) {

    // Kill the user's active sessions
    app.auth.killSession(user, next);
  });
};
```

Email
-----

Provides templates and hooks for [cantina-email](https://github.com/cantina/cantina-email)
user account related emails.

### Templates
Provides defaults for:
  - **users/account_confirm**
  - **users/email_confirm**
  - **users/account_invitation**
  - **users/password_reset**

Your application may override any of these by providing its own template
with the same name.

### Hooks
Adds a hook to `email:send:before` for the email templates above.
The hook will perform the following:
  - Generate an expiring token
    - `prefix`: Defaults to `"password-reset"` for `users/password_reset`
    template, `"account"` for all others. Your application may override this
    by setting `vars.preset` in the `app.email.send` vars.
    - `expire`:  Defaults to 24 hours for `users/password_reset` template,
    7 days for all others. Your application may override this by setting
    `vars.expire` in the `app.email.send` vars.
  - Add `vars.app`
    - The result of `app.conf.get('app')`.
    - Required for the default email templates:
      - `app.title`
      - `app.email`
    - Your application may override this by setting `vars.app` in the
    `app.email.send` vars.
  - Add `vars.url`
    - A url build of the conf's `app.protocol`, `app.domain`, and a pathname
    appended with the generated token. The pathnames are:
      - `/forgot/{token}`
      - `/account-confirm/{token}`
      - `/email-confirm/{token}`
      - `/account-invitation/{token}`
    Your application may override this by setting `vars.pathname` or `vars.url` in the
    `app.email.send` vars.

API Reference
-------------

### `app.collections.users`

Exentded namespace for user models

#### `app.collections.users.findByAuth(email, password, cb)`

Load user with matching email from the database and verifies password. Returns
a sanitized user model, if match is found.

### `app.auth`

Namespace for authentication-related API

#### `app.auth.logIn(user, req, res, next)`

Invokes `req.logIn` and adds the `req.sessionID` to a set of sessionIDs for the
 user in redis.

#### `app.auth.setPassword(user, password, cb)`

Sets the auth property on the user model to be a `bcrypt` hash of the password

#### `app.auth.checkPassword(user, password, cb)`

Checks the password against the user's auth property using `bcrypt.compare`

#### `app.auth.killSession(user, sessionID, cb)`

Destroys the session and removes the sessionID from user's set in redis.

#### `app.auth.killAllSessions(user, cb)`

Loads the user's sessionIDs from redis and destroys each. Deletes the user's
set of sessionIDs in redis.

#### `app.auth.logOut(req, cb)`

Invokes `req.logOut` and `app.auth.killSession` for the authenticated user

### `app.serializeUser(user, cb)`

Implements user serialization for cantina-auth. Returns the user model's `id`
property.

### `app.deserializeUser(id, cb)`

Implements user deserialization for cantina-auth. Loads and returns the user
with matching `id` in `app.collections.user`.

### `app.verifyTwitterUser(token, tokenSecret, profile, done)`

Implements account verification for cantina-auth-twitter. Creates or updates
the existing user account with matching `email`on `app.collections.user`.

### `app.verifyFacebookUser(token, tokenSecret, profile, done)`

Implements account verification for cantina-auth-facebook. Creates or updates
the existing user account with matching `email`on `app.collections.user`.

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)

Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Santa Cruz, CA and Washington, D.C.
