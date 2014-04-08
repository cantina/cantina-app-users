describe('emails', function () {
  var app
    , url = require('url');

  before(function (done) {
    app = require('cantina');
    app.boot(function (err) {
      assert.ifError(err);

      app.silence();

      app.conf.add({
        site: {
          protocol: 'https',
          domain: 'www.test.com',
          title: 'Test Suite Site'
        }
      });
      require('../');

      app.start(done);
    });
  });

  after(function (done) {
    app.destroy(done);
  });

  it('registers own email templates', function () {
    assert(app.email.templates['users/account_confirm']);
    assert(app.email.templates['users/email_confirm']);
    assert(app.email.templates['users/account_invitation']);
    assert(app.email.templates['users/password_reset']);
  });

  it('can send password reset email', function (done) {
    app.email.send('users/password_reset', {user: {id: 1}}, function (err) {
      assert.ifError(err);
      assert.equal(app.email.sent.length, 1);

      var email = app.email.sent[0];
      assert.equal(email.envelope.stamp, 'Postage paid, Par Avion');
      done();
    });
  });

  it('adds url with token to password reset email', function (done) {
    var vars = {
      user: {
        id: '123'
      }
    };
    app.hook('email:send:before').run('users/password_reset', vars, function (err) {
      assert.ifError(err);
      assert(vars.url);
      var parts = url.parse(vars.url);
      assert(parts.pathname.match(/\/password-reset\//));
      var token = parts.pathname.replace(/\/password-reset\//, '');
      app.tokens.check(token, 'password-reset', function (err, exists) {
        assert.ifError(err);
        assert(exists);
        done();
      });
    });
  });


  it ('can send account confirmation email', function (done) {
    app.email.send('users/account_confirm', {user: {id: 2}}, function (err) {
      assert.ifError(err);
      assert.equal(app.email.sent.length, 2);

      var email = app.email.sent[1];
      assert.equal(email.envelope.stamp, 'Postage paid, Par Avion');
      done();
    });
  });

  it('adds url with token to account confirmation email', function (done) {
    var vars = {
      user: {
        id: '123'
      }
    };
    app.hook('email:send:before').run('users/account_confirm', vars, function (err) {
      assert.ifError(err);
      assert(vars.url);
      var parts = url.parse(vars.url);
      assert(parts.pathname.match(/\/account-confirm\//));
      var token = parts.pathname.replace(/\/account-confirm\//, '');
      app.tokens.check(token, 'account', function (err, exists) {
        assert.ifError(err);
        assert(exists);
        done();
      });
    });
  });

  it ('can send email confirmation email', function (done) {
    app.email.send('users/email_confirm', {user: {id: 3}}, function (err) {
      assert.ifError(err);
      assert.equal(app.email.sent.length, 3);

      var email = app.email.sent[2];
      assert.equal(email.envelope.stamp, 'Postage paid, Par Avion');
      done();
    });
  });

  it('adds url with token to email confirmation email', function (done) {
    var vars = {
      user: {
        id: '123'
      }
    };
    app.hook('email:send:before').run('users/email_confirm', vars, function (err) {
      assert.ifError(err);
      assert(vars.url);
      var parts = url.parse(vars.url);
      assert(parts.pathname.match(/\/email-confirm\//));
      var token = parts.pathname.replace(/\/email-confirm\//, '');
      app.tokens.check(token, 'account', function (err, exists) {
        assert.ifError(err);
        assert(exists);
        done();
      });
    });
  });

  it ('can send account invitation email', function (done) {
    app.email.send('users/account_invitation', {user: {id: 4}}, function (err) {
      assert.ifError(err);
      assert.equal(app.email.sent.length, 4);

      var email = app.email.sent[3];
      assert.equal(email.envelope.stamp, 'Postage paid, Par Avion');
      done();
    });
  });

  it('adds url with token to account invitation email', function (done) {
    var vars = {
      user: {
        id: '123'
      }
    };
    app.hook('email:send:before').run('users/account_invitation', vars, function (err) {
      assert.ifError(err);
      assert(vars.url);
      var parts = url.parse(vars.url);
      assert(parts.pathname.match(/\/account-invitation\//));
      var token = parts.pathname.replace(/\/account-invitation\//, '');
      app.tokens.check(token, 'account', function (err, exists) {
        assert.ifError(err);
        assert(exists);
        done();
      });
    });
  });
});