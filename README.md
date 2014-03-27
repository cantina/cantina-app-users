cantina-app-users
=================

Authentication API
------------------

Provides a standard implementation of the functionality required by
cantina-auth, as well as session management.

### `app.serializeUser( user, cb )`

Returns the user model's `id` property.

### `app.deserializeUser( id, cb )`

Loads and returns the user with matching `id` in `app.collections.user`.

### `app.auth.logIn( user, req, res, next )`

Invokes `req.logIn` and adds the `req.sessionID` to a set of sessionIDs for the
 user in redis.

### `app.auth.killSession( user, cb )`

Loads the user's sessionIDs from redis and destroys each. Deletes the user's set
of sessionIDs in redis.

### `app.auth.logOut( req, cb )`

Invokes `req.logOut` and `app.auth.killSession` for the authenticated user.