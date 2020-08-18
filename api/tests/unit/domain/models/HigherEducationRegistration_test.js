const HigherEducationRegistration = require('../../../../lib/domain/models/HigherEducationRegistration');
const { expect, catchErr } = require('../../../test-helper');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | HigherEducationRegistration', () => {

  describe('#validate', () => {

    const buildRegistration = (attributes) => new HigherEducationRegistration(attributes);

    const validAttributes = {
      studentNumber: 'A12345',
      firstName: 'Oren',
      lastName: 'Ishii',
      birthdate: '2020-01-01'
    };

    context('when firstName is not present', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, firstName: null });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when all required fields are presents', () => {
      it('is valid', async () => {

        try {
          new HigherEducationRegistration(validAttributes);
        } catch (e) {
          expect.fail('higherEducationRegistration is valid when all required fields are present');
        }
      });
    });

    context('when student number is not present', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, studentNumber: null });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when lastName is not present', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes,lastName: null });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when birthdate is not present', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: null });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when birthdate is not a date', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: 'sdfsdfsdf' });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when birthdate has not a valid format', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: '2020/02/01' });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when email is not correctly formed', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, email: 'sdfsfsdf' });

        expect(error).to.be.instanceOf(EntityValidationError);
      });
    });

    context('when there are several errors', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, firstName: null, lastName: null });

        const errorList = error.invalidAttributes.map(({ attribute }) => attribute);
        expect(errorList).to.exactlyContain(['lastName', 'firstName']);
      });
    });
  });

  describe('#isSupernumerary', () => {

    const attributes = {
      studentNumber: 'A12345',
      firstName: 'Oren',
      lastName: 'Ishii',
      birthdate: '2020-01-01'
    };

    context('when object constructed', () => {
      it('return false', async () => {
        const registration = new HigherEducationRegistration(attributes);

        expect(registration.isSupernumerary).to.be.false;
      });
    });

    context('when setAsSupernumerary is called', () => {
      it('return true', async () => {
        const registration = new HigherEducationRegistration(attributes);

        registration.setIsSupernumerary();
        expect(registration.isSupernumerary).to.be.true;
      });
    });
  });

});
