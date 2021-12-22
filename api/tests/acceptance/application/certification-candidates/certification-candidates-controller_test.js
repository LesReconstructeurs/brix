const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, sinon } = require('../../../test-helper');
const createServer = require('../../../../server');
const { featureToggles } = require('../../../../lib/config');
const ComplementaryCertification = require('../../../../lib/domain/models/ComplementaryCertification');

describe('Acceptance | API | Certifications candidates', function () {
  describe('POST /api/certification-candidates/:id/authorize-to-start', function () {
    context('when user is authenticated', function () {
      describe('when FT_END_TEST_SCREEN_REMOVAL_ENABLED is enabled', function () {
        it('should return a 204 status code', async function () {
          // given
          sinon.stub(featureToggles, 'isEndTestScreenRemovalEnabled').value(true);

          const server = await createServer();
          const userId = databaseBuilder.factory.buildUser().id;
          const session = databaseBuilder.factory.buildSession({ publishedAt: null });
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            sessionId: session.id,
          });
          await databaseBuilder.commit();
          const options = {
            method: 'POST',
            url: `/api/certification-candidates/${candidate.id}/authorize-to-start`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId, 'pix-certif') },
            payload: { 'authorized-to-start': true },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });
  });

  describe('POST /api/certification-candidates/:id/authorize-to-resume', function () {
    context('when user is authenticated', function () {
      describe('when FT_END_TEST_SCREEN_REMOVAL_ENABLED is enabled', function () {
        it('should return a 204 status code', async function () {
          // given
          sinon.stub(featureToggles, 'isEndTestScreenRemovalEnabled').value(true);

          const server = await createServer();
          const userId = databaseBuilder.factory.buildUser().id;
          const session = databaseBuilder.factory.buildSession({ publishedAt: null });
          const candidate = databaseBuilder.factory.buildCertificationCandidate({
            sessionId: session.id,
          });
          await databaseBuilder.commit();
          const options = {
            method: 'POST',
            url: `/api/certification-candidates/${candidate.id}/authorize-to-resume`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId, 'pix-certif') },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });
  });

  describe('PATCH /api/certification-candidates/{id}/end-assessment-by-supervisor', function () {
    context('when user is authenticated', function () {
      describe('when FT_END_TEST_SCREEN_REMOVAL_ENABLED is enabled', function () {
        it('should return a 204 status code', async function () {
          // given
          sinon.stub(featureToggles, 'isEndTestScreenRemovalEnabled').value(true);

          const server = await createServer();
          const candidateUserId = databaseBuilder.factory.buildUser({}).id;
          const sessionId = databaseBuilder.factory.buildSession().id;
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            sessionId,
            userId: candidateUserId,
          }).id;
          databaseBuilder.factory.buildCertificationCandidate({
            id: 1001,
            sessionId,
            userId: candidateUserId,
          });
          databaseBuilder.factory.buildAssessment({
            state: 'started',
            userId: candidateUserId,
            type: 'CERTIFICATION',
            certificationCourseId,
          });
          await databaseBuilder.commit();

          const options = {
            method: 'PATCH',
            url: `/api/certification-candidates/1001/end-assessment-by-supervisor`,
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });
  });

  describe('GET /api/certification-candidates/:id/subscriptions', function () {
    it('should return the certification candidate subscriptions', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;

      const session = databaseBuilder.factory.buildSession();
      const candidate = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
      });

      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        name: ComplementaryCertification.CLEA,
      });
      const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        name: ComplementaryCertification.PIX_PLUS_DROIT,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: candidate.id,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: candidate.id,
        complementaryCertificationId: pixPlusDroitComplementaryCertification.id,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/certification-candidates/${candidate.id}/subscriptions`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId, 'pix-certif') },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        id: `${candidate.id}`,
        type: 'certification-candidate-subscriptions',
        attributes: {
          'session-id': session.id,
          'eligible-subscriptions': [],
          'non-eligible-subscriptions': [
            {
              id: cleaComplementaryCertification.id,
              name: 'CléA Numérique',
            },
            {
              id: pixPlusDroitComplementaryCertification.id,
              name: 'Pix+ Droit',
            },
          ],
        },
      });
    });
  });
});
