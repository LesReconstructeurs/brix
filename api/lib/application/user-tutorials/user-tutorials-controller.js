const usecases = require('../../domain/usecases');
const userSavedTutorialSerializer = require('../../infrastructure/serializers/jsonapi/user-saved-tutorial-serializer');
const tutorialSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-serializer');
const userSavedTutorialRepository = require('../../infrastructure/repositories/user-saved-tutorial-repository');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');

module.exports = {
  async add(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;
    const userSavedTutorial = userSavedTutorialSerializer.deserialize(request.payload);

    const createdUserSavedTutorial = await usecases.addTutorialToUser({ ...userSavedTutorial, userId, tutorialId });

    return h.response(userSavedTutorialSerializer.serialize(createdUserSavedTutorial)).created();
  },

  async find(request) {
    const { userId } = request.auth.credentials;
    const { page, filter: filters } = queryParamsUtils.extractParameters(request.query);
    const locale = requestResponseUtils.extractLocaleFromRequest(request);
    const { tutorials, meta } = await usecases.findPaginatedFilteredTutorials({
      userId,
      filters,
      page,
      locale,
    });
    return tutorialSerializer.serialize(tutorials, meta);
  },

  async removeFromUser(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;

    await userSavedTutorialRepository.removeFromUser({ userId, tutorialId });

    return h.response().code(204);
  },
};
