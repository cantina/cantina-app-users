describe('permissions', function (){
  var app;

  before(function (done) {
    app = require('cantina');
    app.boot(function (err) {
      assert.ifError(err);

      app.silence();
      require('../');

      app.start(done);
    });
  });

  after(function (done) {
    app.destroy(done);
  });

  it('can define a context', function (done) {
    app.permissions.define('documents', {
      owner: ['read', 'edit', 'delete'],
      viewer:['read'],
      collaborator: ['read', 'edit']
    });
    done();
  });

  it('can grant a role', function (done) {
    app.permissions.grant({
      context: 'documents',
      user: 'erin',
      role: 'owner',
      object: {id: 'doc1'}
    }, function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('runs hooks on permission:grant', function (done) {
    var calledOnce = false;
    app.hook('permissions:grant').add(function test () {
      if (calledOnce) {
        return;
      }
      calledOnce = true;
      done();
    });
    app.permissions.grant({
      context: 'documents',
      user: 'erin',
      role: 'collaborator',
      object: {id: 'doc1'}
    }, function () {});
  });

  it('can revoke a role', function (done) {
    app.permissions.revoke({
      context: 'documents',
      user: {id: 'erin'},
      role: 'owner',
      object: 'doc1'
    }, function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('runs hooks on permission:revoke', function (done) {
    var calledOnce = false;
    app.hook('permissions:revoke').add(function test () {
      if (calledOnce) {
        return;
      }
      calledOnce = true;
      done();
    });
    app.permissions.revoke({
      context: 'documents',
      user: 'erin',
      role: 'owner',
      object: {id: 'doc1'}
    }, function () {});
  });

  it('can check for access', function (done) {
    app.permissions.access({
      context: 'documents',
      user: 'erin',
      object: 'doc1',
      verb: 'delete'
    }, function (err, can) {
      assert.ifError(err);
      assert(!can);
      done();
    });
  });

  it('can check for anyAccess', function (done) {
    app.permissions.anyAccess([
      {
        context: 'documents',
        user: 'erin',
        object: 'doc1',
        verb: 'delete'
      }, {
        context: 'documents',
        user: 'erin',
        object: 'doc1',
        verb: 'edit'
      }], function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('can get a list of users with a given access over an object', function (done) {
    app.permissions.who({
      verb: 'edit',
      context: 'documents',
      object: 'doc1'
    }, function (err, users) {
      assert.ifError(err);
      assert.equal(users.length, 1);
      assert.equal(users[0], 'erin');
      done();
    });
  });

  it('can get a list of objects a user has access to', function (done) {
    app.permissions.what({
      role: 'collaborator',
      context: 'documents',
      user: 'erin'
    }, function (err, objects) {
      assert.ifError(err);
      assert.equal(objects.length, 1);
      assert.equal(objects[0], 'doc1');
      done();
    });
  });

  it('can get a list of actions a user can do to an object', function (done) {
    app.permissions.actions({
      context: 'documents',
      user: 'erin',
      object: 'doc1'
    }, function (err, actions) {
      assert.ifError(err);
      assert.equal(actions.length, 2);
      assert(actions.indexOf('read') >= 0);
      assert(actions.indexOf('edit') >= 0);
      done();
    });
  })
});
