var app = require('cantina');

require('cantina-models-mongo');
require('cantina-models-schemas');

app.loadSchemas('schemas');

app.once('collection:create:users', function (collection) {
  collection.ensureIndex(app.schemas.user.indexes.mongo, function (err) {
    if (err) app.emit('error', err);
  });
});

app.hook('start').add(function (done) {
  app.createMongoCollection('users', app.schemas.user.getOptions());
  done();
});
