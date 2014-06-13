var app = require('cantina')
  , _ = require('underscore');

if (app.conf.get('auth-twitter') || app.conf.get('auth-facebook')) {
  app.Schema.extend(app.schemas.user, {
    properties: {
      provider: {
        id: {
          type: 'string'
        },
        name: {
          type: 'string'
        }
      }
    }
  });
}

if (app.conf.get('auth-twitter')) {
  app.verifyTwitterUser = function (token, tokenSecret, profile, done) {

    var nameParts = profile._json.name.split(' ');
    var normalizedData = {
      provider: {
        id: profile.id,
        name: profile.provider
      },
      username: profile.username || profile.displayName,
      name: {
        first: nameParts.length ? nameParts[0] : undefined,
        last: nameParts.length > 1 ? nameParts[1] : undefined,
        full: profile.__json.name
      },
      email: profile._json.email,
      avatar: profile.photos && profile.photos.length ? profile.photos[0].value : undefined
    };
    return createOrUpdateProfile(normalizedData, done);
  };
}

if (app.conf.get('auth-facebook')) {
  app.verifyFacebookUser = function (token, tokenSecret, profile, done) {

    var normalizedData = {
      provider_id: profile.id,
      provider: profile.provider,
      username: profile.username || profile.displayName,
      name: {
        first: profile.__json.first_name,
        last: profile.__json.last_name
      },
      email: profile._json.email,
      avatar: 'https://graph.facebook.com/' + profile.id + '/picture'
    };
    return createOrUpdateProfile(normalizedData, done);
  };
}

function createOrUpdateProfile (data, done) {

  // Verify user data, then load/save the user model.
  if (data && data.provider_id) {

    app.collections.users.load({'email_lc': data.email.toLowerCase()}, function(err, user) {
      if (err) return done(err);
      if (user) {
        // Update local user data from upstream
        user = _.defaults(user, data);
        app.collections.user.save(user, done);
      }
      else {
        // Create a new user model.
        app.collections.user.create(data, done);
      }
    });
  }
  else {
    done(null, false, {message: 'Not a valid user'});
  }
}
