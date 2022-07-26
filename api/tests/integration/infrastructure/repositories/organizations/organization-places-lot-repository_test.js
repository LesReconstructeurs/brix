const { expect, databaseBuilder, catchErr } = require('../../../../test-helper');
const { knex } = require('../../../../../db/knex-database-connection');
const organizationPlacesLotRepository = require('../../../../../lib/infrastructure/repositories/organizations/organization-places-lot-repository');
const OrganizationPlacesLotManagement = require('../../../../../lib/domain/read-models/OrganizationPlacesLotManagement');
const OrganizationPlacesLot = require('../../../../../lib/domain/models/OrganizationPlacesLot');
const categories = require('../../../../../lib/domain/constants/organization-places-categories');
const { NotFoundError } = require('../../../../../lib/domain/errors');

describe('Integration | Repository | Organization Place', function () {
  describe('#findByOrganizationId', function () {
    it('should return organization place model for given id', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const user = databaseBuilder.factory.buildUser.withRole({ firstName: 'Gareth', lastName: 'Edwards' });
      const placeGZ = databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        count: 66,
        category: 'T2',
        reference: 'Godzilla',
        activationDate: new Date('2014-05-13'),
        expirationDate: new Date('2021-07-01'),
        createdBy: user.id,
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

      // then
      expect(foundOrganizationPlace[0].id).to.equal(placeGZ.id);
      expect(foundOrganizationPlace[0].count).to.equal(placeGZ.count);
      expect(foundOrganizationPlace[0].status).to.equal(OrganizationPlacesLotManagement.statuses.EXPIRED);
      expect(foundOrganizationPlace[0].category).to.equal(OrganizationPlacesLotManagement.categories[placeGZ.category]);
      expect(foundOrganizationPlace[0].reference).to.equal(placeGZ.reference);
      expect(foundOrganizationPlace[0].creatorFullName).to.equal(`${user.firstName} ${user.lastName}`);

      expect(foundOrganizationPlace[0].activationDate).to.deep.equal(placeGZ.activationDate);
      expect(foundOrganizationPlace[0].expirationDate).to.deep.equal(placeGZ.expirationDate);
    });

    it('should return organization places for given id', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;

      const placeSG1 = databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        reference: 'Stargate SG-1',
      });

      const placeAtlantis = databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        reference: 'Stargate Atlantis',
      });

      databaseBuilder.factory.buildOrganizationPlace({
        organizationId: otherOrganizationId,
        reference: 'Stargate Universe',
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

      // then
      expect(foundOrganizationPlace.length).to.equal(2);
      expect([foundOrganizationPlace[0].reference, foundOrganizationPlace[1].reference]).to.have.members([
        placeSG1.reference,
        placeAtlantis.reference,
      ]);
    });

    it('should return empty when no places defined', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);
      // then
      expect(foundOrganizationPlace.length).to.equal(0);
    });

    it("should return creator place's name for given id", async function () {
      // given
      const user = databaseBuilder.factory.buildUser({ firstName: 'Jack', lastName: "O'Neill" });
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildOrganizationPlace({
        organizationId,
        reference: 'Stargate SG-1',
        createdBy: user.id,
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

      // then
      expect(foundOrganizationPlace[0].creatorFullName).to.equal(`${user.firstName} ${user.lastName}`);
    });

    describe('When activationDate are different', function () {
      it('should return organization places in descending order for activationDate', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlace1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1994-10-28'),
        });

        const organizationPlace2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

        // then
        expect(foundOrganizationPlace[0].id).to.deep.equal(organizationPlace2.id);
        expect(foundOrganizationPlace[1].id).to.deep.equal(organizationPlace1.id);
      });
    });

    describe('When activationDate are identical', function () {
      it('should return organization places in descending order for expirationDate', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlace1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
          expirationDate: new Date('2011-05-09'),
        });

        const organizationPlace2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
          expirationDate: new Date('2007-03-13'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

        // then
        expect(foundOrganizationPlace[0].id).to.deep.equal(organizationPlace1.id);
        expect(foundOrganizationPlace[1].id).to.deep.equal(organizationPlace2.id);
      });
    });

    describe('When activationDate and expirationDate are identical', function () {
      it('should return organization places in descending order for createdAt', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        const organizationPlace1 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
          expirationDate: new Date('2007-03-13'),
          createdAt: new Date('1994-10-28'),
        });

        const organizationPlace2 = databaseBuilder.factory.buildOrganizationPlace({
          organizationId,
          activationDate: new Date('1997-07-27'),
          expirationDate: new Date('2007-03-13'),
          createdAt: new Date('1997-07-27'),
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationPlace = await organizationPlacesLotRepository.findByOrganizationId(organizationId);

        // then
        expect(foundOrganizationPlace[0].id).to.deep.equal(organizationPlace2.id);
        expect(foundOrganizationPlace[1].id).to.deep.equal(organizationPlace1.id);
      });
    });
  });

  describe('#create', function () {
    afterEach(function () {
      return knex('organization-places').delete();
    });

    it('should create the given lot of places', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const user = databaseBuilder.factory.buildUser.withRole({ firstName: 'Gareth', lastName: 'Edwards' });

      const placesToSave = new OrganizationPlacesLot({
        organizationId,
        count: 66,
        category: categories.FREE_RATE,
        reference: 'Godzilla',
        activationDate: new Date('2014-05-13'),
        expirationDate: new Date('2021-07-01'),
        createdBy: user.id,
      });

      await databaseBuilder.commit();

      // when
      const createdOrganizationPlacesLotId = await organizationPlacesLotRepository.create(placesToSave);

      // then
      const places = await knex('organization-places').where('id', createdOrganizationPlacesLotId).first();
      expect(places).to.deep.include(placesToSave);
    });
  });

  describe('#get', function () {
    it('finds an organizationPlace by id', async function () {
      const organizationPlaceId = databaseBuilder.factory.buildOrganizationPlace().id;

      await databaseBuilder.commit();
      //when
      const organizationPlaceSet = await organizationPlacesLotRepository.get(organizationPlaceId);

      expect(organizationPlaceSet.id).to.equal(organizationPlaceId);
    });

    it('throws a not found error when organization Places lot is not found ', async function () {
      //given
      const organizationPlaceId = 0;
      //when
      const error = await catchErr(organizationPlacesLotRepository.get)(organizationPlaceId);

      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });
});