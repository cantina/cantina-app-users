module.exports = function (app) {
  app.load('conf');

  app.require('cantina-models-schemas');
  app.require('cantina-models-mongo');
  app.require('cantina-permissions');
  app.require('./email');

  app.load('schemas');
  app.load('plugins');
  app.load('email');
  app.load('collections');
};
