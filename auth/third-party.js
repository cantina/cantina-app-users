var app = require('cantina');

if (app.conf.get('auth-twitter') || app.conf.get('auth-facebook')) {
  app.users.schema = app.schemas.extend(app.users.schema, {
    properties: {
      provider_id: {
        type: 'string'
      },
      provider: {
        type: 'string'
      }
    }
  });

  app.users.schema._indexes.push({provider_id: 1});
}

function createOrUpdateProfile (data, done) {

  // Verify user data, then load/save the user model.
  if (data && data.provider_id) {

    app.collections.users.find({provider_id: data.id}, function(err, user) {
      if (err) return done(err);
      if (user) {
        // Update local user data from upstream
        user = _.extend(user, data);
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

app.verifyTwitterUser = function (token, tokenSecret, profile, done) {

  //todo - fit this into our schema, when we choose it
  var nameParts = profile._json.name.split(' ');
  var normalizedData = {
    provider_id: profile.id,
    provider: profile.provider,
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

app.verifyFacebookUser = function (token, tokenSecret, profile, done) {

  //todo - fit this into our schema, when we choose it
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