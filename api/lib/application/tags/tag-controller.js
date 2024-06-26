const tagSerializer = require('../../infrastructure/serializers/jsonapi/tag-serializer');
const usecases = require('../../domain/usecases');

module.exports = {
  async create(request, h) {
    const tagName = request.payload.data.attributes['name'].toUpperCase();
    const createdTag = await usecases.createTag({ tagName });
    return h.response(tagSerializer.serialize(createdTag)).created();
  },

  async findAllTags() {
    const organizationsTags = await usecases.findAllTags();
    return tagSerializer.serialize(organizationsTags);
  },
};
