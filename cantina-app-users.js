var app = require('cantina');

require('cantina-models-mongo');

app.hook('start').add(function (done) {
  app.createMongoCollection('users');
  done();
});
