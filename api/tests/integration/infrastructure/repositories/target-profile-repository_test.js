const { expect, databaseBuilder, sinon } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const Skill = require('../../../../lib/domain/models/Skill');
const SkillDataObject = require('../../../../lib/infrastructure/datasources/airtable/objects/Skill');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');

describe('Integration | Repository | Target-profile', function() {

  let targetProfile;
  let targetProfileFirstSkill;
  let skillAssociatedToTargetProfile;

  describe('#get', function() {

    beforeEach(async () => {

      targetProfile = databaseBuilder.factory.buildTargetProfile({});
      targetProfileFirstSkill = databaseBuilder.factory.buildTargetProfilesSkills({ targetProfileId: targetProfile.id });

      await databaseBuilder.commit();

      skillAssociatedToTargetProfile = new SkillDataObject({ id: targetProfileFirstSkill.skillId, name: '@Acquis2' });
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([skillAssociatedToTargetProfile]);
    });

    afterEach(async () => {
      skillDatasource.findByRecordIds.restore();
      await databaseBuilder.clean();
    });

    it('should return the target profile with its associated skills', function() {
      // when
      const promise = targetProfileRepository.get(targetProfile.id);

      // then
      return promise.then((foundTargetProfile) => {
        expect(skillDatasource.findByRecordIds).to.have.been.calledWith([targetProfileFirstSkill.skillId]);

        expect(foundTargetProfile).to.be.an.instanceOf(TargetProfile);

        expect(foundTargetProfile.skills).to.be.an('array');
        expect(foundTargetProfile.skills.length).to.equal(1);
        expect(foundTargetProfile.skills[0]).to.be.an.instanceOf(Skill);
        expect(foundTargetProfile.skills[0].id).to.equal(skillAssociatedToTargetProfile.id);
        expect(foundTargetProfile.skills[0].name).to.equal(skillAssociatedToTargetProfile.name);
      });
    });

  });

});
