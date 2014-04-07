var app = require('cantina');

require('cantina-validators');

module.exports = {
  name: 'user',
  indexes: {
    mongo: [
      { email_lc: 1 },
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
      validators: [app.validators.matches(/^[a-zA-Z0-9_]{3,32}$/)]
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
          if (model.last_name) name.push(model.last_name);
          if (model.first_name) name.push(model.first_name);
          if (name.length === 2) {
            return name.join(' ');
          }
          else if (name.length === 1) {
            return name[0];
          }
          else {
            return '';
          }
        }
      },
      sortable: {
        type: 'string',
        prepare: function (model) {
          var name = [];
          if (model.last_name) name.push(model.last_name);
          if (model.first_name) name.push(model.first_name);
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
      validators: [app.validators.matches(/^(?:active|disabled)$/)],
      default: 'active'
    }
  }
};
