const buildOrganization = require('./build-organization');
const buildTargetProfile = require('./build-target-profile');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildTargetProfileShare({
  id = databaseBuffer.getNextId(),
  targetProfileId,
  organizationId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  targetProfileId = _.isUndefined(targetProfileId) ? buildTargetProfile().id : targetProfileId;
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;

  const values = {
    id,
    targetProfileId,
    organizationId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profile-shares',
    values,
  });
};
