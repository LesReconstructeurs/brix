const Joi = require('joi').extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');

const SUPER_ADMIN = 'SUPER_ADMIN';

const roles = {
  SUPER_ADMIN,
};

class PixAdminRole {
  constructor({ id, userId, role, createdAt, updatedAt, disabledAt } = {}) {
    this.id = id;
    this.userId = userId;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.disabledAt = disabledAt;

    validateEntity(
      Joi.object({
        id: Joi.number().integer().optional(),
        userId: Joi.number().required(),
        role: Joi.string().valid(roles.SUPER_ADMIN).required(),
        createdAt: Joi.date().allow(null).optional(),
        updatedAt: Joi.date().allow(null).optional(),
        disabledAt: Joi.date().allow(null).optional(),
      }),
      this
    );
  }
}

module.exports = PixAdminRole;
module.exports.roles = roles;
