var app = require('cantina')
  , defaultUserSchema = require('./default-user-schema');

require('cantina-models-mongo');
require('cantina-models-schemas');

app.users = {
  // The app can override or extend the schema
  schema: defaultUserSchema
};

app.once('collection:create:users', function (collection) {
  collection.ensureIndex(app.users.schema._indexes, function (err) {
    if (err) app.emit('error', err);
  });
});

app.hook('start').add(function (done) {
  app.createMongoCollection('users', app.schemas.getCollectionOptions(app.users.schema));
  done();
});
