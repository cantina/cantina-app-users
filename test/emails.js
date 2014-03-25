describe('emails', function () {
  var app;

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
    assert(app.email.templates['cantina-app-users/account_confirm']);
    assert(app.email.templates['cantina-app-users/email_confirm']);
    assert(app.email.templates['cantina-app-users/invitation']);
    assert(app.email.templates['cantina-app-users/password']);
  });

  it('can send password reset email', function (done) {
    app.users.sendPasswordResetEmail({user: {id: 1}}, function (err) {
      assert.ifError(err);
      assert.equal(app.email.sent.length, 1);

      var email = app.email.sent[0];
      assert.equal(email.envelope.stamp, 'Postage paid, Par Avion');
      done();
    });
  });

  it ('can send account confirmation email', function (done) {
    app.users.sendAccountConfirmEmail({user: {id: 2}}, function (err) {
      assert.ifError(err);
      assert.equal(app.email.sent.length, 2);

      var email = app.email.sent[1];
      assert.equal(email.envelope.stamp, 'Postage paid, Par Avion');
      done();
    });
  });

  it ('can send email confirmation email', function (done) {
    app.users.sendEmailConfirmEmail({user: {id: 3}}, function (err) {
      assert.ifError(err);
      assert.equal(app.email.sent.length, 3);

      var email = app.email.sent[2];
      assert.equal(email.envelope.stamp, 'Postage paid, Par Avion');
      done();
    });
  });

  it ('can send account invitation email', function (done) {
    app.users.sendInvitationEmail({user: {id: 4}}, function (err) {
      assert.ifError(err);
      assert.equal(app.email.sent.length, 4);

      var email = app.email.sent[3];
      assert.equal(email.envelope.stamp, 'Postage paid, Par Avion');
      done();
    });
  });
});