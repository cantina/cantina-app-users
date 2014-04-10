var app = require('cantina')
  , idgen = require('idgen');

require('cantina-validators');

module.exports = {
  name: 'user',
  indexes: {
    mongo: [
      [ { email_lc: 1 }, { unique: true } ],
      [ { username_lc: 1 }, { unique: true } ],
      { 'name.sortable': 1 }
    ]
  },
  properties: {
    id: {
      type: 'string',
      required: true
    },
    created: {
      type: 'date',
      required: true
    },
    updated: {
      type: 'date',
      required: true
    },
    username: {
      type: 'string',
      required: true,
      validators: [app.validators.matches(/^[a-zA-Z0-9_]{3,32}$/)],
      prepare: function (model) {
        if (model.username) {
          return model.username;
        }
        var username = [];
        if (model.name) {
          if (model.name.first) username.push(model.name.first);
          if (model.name.last) username.push(model.name.last);
        }
        username = username.join('').replace(/[^a-zA-Z0-9_]/g, '').substring(0, 32 - 7) + '_' + idgen(6);
        return username;
      }
    },
    username_lc: {
      type: 'string',
      private: true,
      prepare: function (model) {
        if (!model.username) {
          model.username = app.schemas.user.properties.username.prepare(model);
        }
        return model.username.toLowerCase();
      }
    },
    email: {
      type: 'string',
      required: true,
      validators: [app.validators.isEmail]
    },
    email_lc: {
      type: 'string',
      private: true,
      prepare: function (model) {
        return model.email.toLowerCase();
      }
    },
    email_other: [{
      type: 'string',
      validators: [app.validators.isEmail]
    }],
    auth: {
      type: 'string',
      private: true,
      validators: [app.validators.isType('string')],
      default: ''
    },
    name: {
      first: {
        type: 'string',
        validators: [app.validators.isType('string')],
        default: ''
      },
      last: {
        type: 'string',
        validators: [app.validators.isType('string')],
        default: ''
      },
      full: {
        type: 'string',
        prepare: function (model) {
          var name = [];
          if (model.name) {
            if (model.name.first) name.push(model.name.first);
            if (model.name.last) name.push(model.name.last);
          }
          return name.join(' ');
        }
      },
      sortable: {
        type: 'string',
        prepare: function (model) {
          var name = [];
          if (model.name) {
            if (model.name.last) name.push(model.name.last);
            if (model.name.first) name.push(model.name.first);
          }
          if (name.length === 2) {
            return name.join(', ');
          }
          else if (name.length === 1) {
            return name[0];
          }
          else {
            return model.username;
          }
        }
      }
    },
    status: {
      type: 'string',
      required: true,
      validators: [app.validators.matches(/^(?:active|disabled|requested|invited|unconfirmed)$/)],
      default: 'active'
    }
  }
};
