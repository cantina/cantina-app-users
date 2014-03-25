var app = require('cantina')
  , site = app.conf.get('site')
  , url = require('url');

require('cantina-tokens');
require('cantina-email');

app.email.registerTemplateDir('cantina-app-users', require('path').resolve(__dirname, './templates'));

app.users.sendPasswordResetEmail = function (options, cb) {

  // Create an expiring token - default to 24 hrs
  var opts = {
    prefix: options.prefix || 'password-reset',
    expire: options.expire || 86400000
  };
  app.tokens.create(options.user.id, opts, function (err, token) {
    if (err) return cb(err);

    options.url = options.url || url.format({
      protocol: site.protocol,
      host: site.domain,
      pathname: '/password-reset/' + token
    });
    options.site || (options.site = site);
    app.email.send(options.template || 'cantina-app-users/password', options, cb);
  });
};

app.users.sendAccountConfirmEmail = function (options, cb) {

  // Create an expiring token - default to 7 days
  var opts = {
    prefix: options.prefix || 'account',
    expire: options.expire || 604800000
  };
  app.tokens.create(options.user.id, opts, function (err, token) {
    if (err) return cb(err);

    options.url = options.url || url.format({
      protocol: site.protocol,
      host: site.domain,
      pathname: '/account-confirm/' + token
    });
    options.site || (options.site = site);
    app.email.send(options.template || 'cantina-app-users/account_confirm', options, cb);
  });
};

app.users.sendInvitationEmail = function (options, cb) {

  // Create an expiring token - default to 7 days
  var opts = {
    prefix: options.prefix || 'account',
    expire: options.expire || 604800000
  };
  app.tokens.create(options.user.id, opts, function (err, token) {
    if (err) return cb(err);

    options.url = options.url || url.format({
      protocol: site.protocol,
      host: site.domain,
      pathname: '/invitation/' + token
    });
    options.site || (options.site = site);
    app.email.send(options.template || 'cantina-app-users/invitation', options, cb);
  });
};

app.users.sendEmailConfirmEmail = function (options, cb) {

  // Create an expiring token - default to 7 days
  var opts = {
    prefix: options.prefix || 'account',
    expire: options.expire || 604800000
  };
  app.tokens.create(options.user.id, opts, function (err, token) {
    if (err) return cb(err);

    options.url = options.url || url.format({
      protocol: site.protocol,
      host: site.domain,
      pathname: '/email-confirm/' + token
    });
    options.site || (options.site = site);
    app.email.send(options.template || 'cantina-app-users/email_confirm', options, cb);
  });
};