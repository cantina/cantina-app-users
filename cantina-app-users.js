var app = require('cantina');

app.load('conf');

require('cantina-models-schemas');
require('cantina-models-mongo');
require('cantina-permissions');
require('./email');

app.load('schemas');
app.load('plugins');
app.load('email');
app.load('collections');
