var app = require('cantina');

function createOrUpdateProfile (data, done) {

  // Verify user data, then load/save the user model.
  if (data && data.provider_id) {

    app.users.find({provider_id: data.id}, function(err, user) {
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
    name: { "givenName": nameParts.length ? nameParts[0] : undefined, "familyName": nameParts.length > 1 ? nameParts[1] : undefined},
    displayName: profile.displayName,
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
    name: { "givenName": profile._json.first_name, "familyName": profile._json.last_name},
    displayName: profile.displayName,
    email: profile._json.email,
    avatar: 'https://graph.facebook.com/' + profile.id + '/picture'
  };
  return createOrUpdateProfile(normalizedData, done);
};