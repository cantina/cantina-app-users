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
    app.permissions.define('document', {
      owner: ['read', 'edit', 'delete'],
      viewer:['read'],
      collaborator: ['read', 'edit'],
      admin: ['administrate']
    });
    done();
  });

  it('can grant a role on an object', function (done) {
    app.permissions['document'].grant('owner', {user: 'erin', object: {id: 'doc1'}}, function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('can grant a role without an object', function (done) {
    app.permissions['document'].grant('admin', 'erin', function (err) {
      assert.ifError(err);
      done();
    })
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
    app.permissions['document'].grant('collaborator', {user: 'erin', object: {id: 'doc1'}}, function () {});
  });

  it('can revoke a role', function (done) {
    app.permissions['document'].revoke('owner', {user: {id: 'erin'}, object: 'doc1'}, function (err) {
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
    app.permissions['document'].revoke('owner', {user: {id: 'erin'}, object: 'doc1'}, function () {});
  });

  it('can check if a user can perform a verb on an object', function (done) {
    app.permissions['document'].can('delete', {user: 'erin', object: 'doc1'}, function (err, can) {
      assert.ifError(err);
      assert(!can);
      done();
    });
  });

  it('can check if a user can perform a verb without an object', function (done) {
    app.permissions['document'].can('administrate', {id: 'erin'}, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('can check if a user has a role', function (done) {
    app.permissions['document'].hasRole('owner', {user: 'erin', object: 'doc1'}, function (err, can) {
      assert.ifError(err);
      assert(!can);
      done();
    });
  });

  it('can check for one of many access levels', function (done) {
    app.permissions['document'].any(['delete', 'edit'], {user: 'erin', object: 'doc1'}, function (err, can) {
      assert.ifError(err);
      assert(can);
      done();
    });
  });

  it('can check for all of many access levels', function (done) {
    app.permissions['document'].all(['delete', 'edit'], {user: 'erin', object: 'doc1'}, function (err, can) {
      assert.ifError(err);
      assert(!can);
      done();
    });
  });

  it('can get a list of users who can perform a verb an object', function (done) {
    app.permissions['document'].whoCan('edit', 'doc1', function (err, users) {
      assert.ifError(err);
      assert.equal(users.length, 1);
      assert.equal(users[0], 'erin');
      done();
    });
  });


  it('can get a list of users who have a role on an object', function (done) {
    app.permissions['document'].whoIs('collaborator', 'doc1', function (err, users) {
      assert.ifError(err);
      assert.equal(users.length, 1);
      assert.equal(users[0], 'erin');
      done();
    });
  });

  it('can get a list of objects a user has a role over', function (done) {
    app.permissions['document'].whatIs('erin', 'collaborator', function (err, objects) {
      assert.ifError(err);
      assert.equal(objects.length, 1);
      assert.equal(objects[0], 'doc1');
      done();
    });
  });

  it('can get a list of objects a user can perform a verb on', function (done) {
    app.permissions['document'].whatCan('erin', 'edit', function (err, objects) {
      assert.ifError(err);
      assert.equal(objects.length, 1);
      assert.equal(objects[0], 'doc1');
      done();
    });
  });

  it('can get a list of actions a user can do to an object', function (done) {
    app.permissions['document'].whatActions('erin', 'doc1', function (err, actions) {
      assert.ifError(err);
      assert.equal(actions.length, 2);
      assert(actions.indexOf('read') >= 0);
      assert(actions.indexOf('edit') >= 0);
      done();
    });
  })
});
