var app = require('cantina');

module.exports = function (req, res, next) {

  req.access = function (context, verb, next) {
    app.permissions[context].can(verb, {user: req.user, object: req[context]}, next);
  };

  next();
};