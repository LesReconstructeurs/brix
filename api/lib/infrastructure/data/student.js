const moment = require('moment');
const Bookshelf = require('../bookshelf');

require('./user');
require('./organization');

module.exports = Bookshelf.model('Student', {

  tableName: 'students',
  hasTimestamps: ['createdAt', 'updatedAt'],

  user() {
    return this.belongsTo('User', 'userId');
  },

  organization() {
    return this.belongsTo('Organization', 'organizationId');
  },

  parse(rawAttributes) {
    if (rawAttributes && rawAttributes.birthdate) {
      rawAttributes.birthdate = moment(rawAttributes.birthdate).format('YYYY-MM-DD');
    }

    return rawAttributes;
  },

});
