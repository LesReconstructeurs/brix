const { expect, sinon, domainBuilder } = require('../../../test-helper');

const findDivisionsByCertificationCenter = require('../../../../lib/domain/usecases/find-divisions-by-certification-center');

describe('Unit | UseCase | find-divisions-by-certification-center', () => {

  const certificationCenterId = 1;
  let organization;

  const organizationRepository = {
    getIdByCertificationCenterId: sinon.stub(),
  };
  const divisionRepository = {
    findByOrganizationIdForCurrentSchoolYear: sinon.stub(),
  };

  beforeEach(async () => {
    const externalId = 'AAA111';
    const certificationCenter = domainBuilder.buildCertificationCenter({ id: certificationCenterId, externalId });
    organization = domainBuilder.buildOrganization({ externalId });

    organizationRepository.getIdByCertificationCenterId
      .withArgs(certificationCenter.id).resolves(organization.id);
  });

  describe('when user has access to certification center', () => {

    it('should return all divisions', async () => {
      // given
      divisionRepository.findByOrganizationIdForCurrentSchoolYear
        .withArgs({ organizationId: organization.id })
        .resolves([{ name: '3a' }, { name: '3b' }, { name: '5c' }]);

      // when
      const divisions = await findDivisionsByCertificationCenter({
        certificationCenterId,
        organizationRepository,
        divisionRepository,
      });

      // then
      expect(divisions).to.be.deep.equal([{ name: '3a' }, { name: '3b' }, { name: '5c' }]);
    });
  });
});
