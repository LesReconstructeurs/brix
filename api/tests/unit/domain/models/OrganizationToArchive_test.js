const { expect } = require('../../../test-helper');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const OrganizationToArchive = require('../../../../lib/domain/models/OrganizationToArchive');

describe('Unit | Domain | Models | OrganizationToArchive', function () {
  describe('#archive', function () {
    it('should set the invitation status and the archive date', function () {
      // given
      const now = new Date('2022-02-22');
      const organizationToArchive = new OrganizationToArchive({ id: 1 });

      // when
      organizationToArchive.archive({ archiveDate: now });

      // then
      expect(organizationToArchive.previousInvitationStatus).to.equal(OrganizationInvitation.StatusType.PENDING);
      expect(organizationToArchive.newInvitationStatus).to.equal(OrganizationInvitation.StatusType.CANCELLED);
      expect(organizationToArchive.archiveDate).to.equal(now);
    });
  });
});
