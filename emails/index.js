var app = require('cantina')
  , site = app.conf.get('site')
  , url = require('url');

require('cantina-tokens');
require('cantina-email');

app.hook('email:load:templates').add(function (done) {
  app.email.loadTemplates(require('path').resolve(__dirname, './templates'));
  done();
});

app.hook('email:send:before').add(function (name, vars, cb) {
  var opts;

  // Password Reset Email
  if (vars.template === 'password') {

    // Create an expiring token - default to 24 hrs
    opts = {
      prefix: vars.prefix || 'password-reset',
      expire: vars.expire || 86400000
    };
    app.tokens.create(vars.user.id, opts, function (err, token) {
      if (err) return cb(err);

      vars.url = vars.url || url.format({
        protocol: site.protocol,
        host: site.domain,
        pathname: '/password-reset/' + token
      });
      vars.site || (vars.site = site);
      cb();
    });
  }

  // Account/Email Confirmation Emails
  else if (vars.name === 'account_confirm' || vars.name === 'invitation' || vars.name === 'email_confirm') {

    // Create an expiring token - default to 7 days
    opts = {
      prefix: vars.prefix || 'account',
      expire: vars.expire || 604800000
    };
    app.tokens.create(vars.user.id, opts, function (err, token) {
      if (err) return cb(err);

      vars.url = vars.url || url.format({
        protocol: site.protocol,
        host: site.domain,
        pathname: '/' + vars.name + '/' + token
      });
      vars.site || (vars.site = site);
      cb();
    });
  }

  else {
    cb();
  }
});