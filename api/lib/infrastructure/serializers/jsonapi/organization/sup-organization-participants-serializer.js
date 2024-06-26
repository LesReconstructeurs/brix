const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize({ supOrganizationParticipants, meta }) {
    return new Serializer('sup-organization-participants', {
      id: 'id',
      attributes: [
        'lastName',
        'firstName',
        'birthdate',
        'studentNumber',
        'group',
        'participationCount',
        'lastParticipationDate',
        'campaignName',
        'campaignType',
        'participationStatus',
        'isCertifiable',
        'certifiableAt',
      ],
      meta,
    }).serialize(supOrganizationParticipants);
  },
};
