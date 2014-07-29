var url = require('url');

module.exports = function (app) {
  var conf = app.conf.get('app');

  app.require('cantina-tokens');
  app.require('cantina-email');

  app.hook('email:send:before').add(function (name, vars, cb) {
    var opts;

    // Password Reset Email
    if (name === 'users/password_reset') {

      // Create an expiring token - default to 24 hrs
      opts = {
        prefix: vars.prefix || 'password-reset',
        expire: vars.expire || 86400000
      };
      app.tokens.create(vars.user.id, opts, function (err, token) {
        if (err) return cb(err);

        var pathname = vars.pathname || 'forgot';
        vars.url = vars.url || url.format({
          protocol: conf.protocol || 'http',
          host: conf.domain,
          pathname: '/' + pathname + '/' + token
        });
        vars.app || (vars.app = conf);
        cb();
      });
    }

    // Account/Email Confirmation Emails
    else if (name === 'users/account_confirm' || name === 'users/account_invitation' || name === 'users/email_confirm') {

      // Create an expiring token - default to 7 days
      opts = {
        prefix: vars.prefix || 'account',
        expire: vars.expire || 604800000
      };
      app.tokens.create(vars.user.id, opts, function (err, token) {
        if (err) return cb(err);

        var pathname = vars.pathname || name.replace(/users\//, '').replace(/_/g, '-');
        vars.url = vars.url || url.format({
          protocol: conf.protocol || 'http',
          host: conf.domain,
          pathname: '/' + pathname + '/' + token
        });
        vars.app || (vars.app = conf);
        cb();
      });
    }

    else {
      cb();
    }
  });
};