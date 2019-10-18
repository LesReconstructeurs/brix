const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/tutorial-serializer');

describe('Unit | Serializer | JSONAPI | tutorial-serializer', () => {

  describe('#serialize', () => {

    it('should return a serialized JSON data object', () => {
      // given
      const tutorialId = 123;

      const tutorial = domainBuilder.buildTutorial({
        id: tutorialId,
      });

      const expectedSerializedResult = {
        data: {
          id: tutorialId.toString(),
          type: 'tutorials',
          attributes: {
            'duration': '00:01:30',
            'format': 'video',
            'link': 'https://youtube.fr',
            'source': 'Youtube',
            'title': 'Savoir regarder des vidéos youtube.',
          },
        },
      };

      // when
      const result = serializer.serialize(tutorial);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
    it('should return a serialized JSON data object, enhanced by tube information', () => {
      // given
      const tutorialId = 123;

      const tutorial = domainBuilder.buildTutorial({
        id: tutorialId,
      });
      tutorial.tubeName = 'Tube Name';
      tutorial.tubePracticalTitle = 'Tube Practical Title';
      tutorial.tubePracticalDescription = 'Tube Practical Description';

      tutorial.unknownAttribute = 'should not be in result';

      const expectedSerializedResult = {
        data: {
          id: tutorialId.toString(),
          type: 'tutorials',
          attributes: {
            'duration': '00:01:30',
            'format': 'video',
            'link': 'https://youtube.fr',
            'source': 'Youtube',
            'title': 'Savoir regarder des vidéos youtube.',
            'tube-name': 'Tube Name',
            'tube-practical-description': 'Tube Practical Description',
            'tube-practical-title': 'Tube Practical Title',
          },
        },
      };

      // when
      const result = serializer.serialize(tutorial);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
