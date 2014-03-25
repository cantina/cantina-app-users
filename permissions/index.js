var app = require('cantina')
, relations = require('relations');

relations.use(relations.stores.redis, {
  client: app.redis,
  prefix: app.redixKey('relations')
});

app.relations = relations;