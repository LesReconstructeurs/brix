const Joi = require('joi').extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');
const _ = require('lodash');

const validationSchema = Joi.object({
  participantFirstName: Joi.string().required().allow(''),
  participantLastName: Joi.string().required().allow(''),
  participantExternalId: Joi.string().optional().allow(null),
  studentNumber: Joi.string().optional().allow(null),
  userId: Joi.number().integer().required(),
  campaignParticipationId: Joi.number().integer().required(),
  isCompleted: Joi.boolean().required(),
  createdAt: Joi.date().required(),
  sharedAt: Joi.date().required().allow(null),
  division: Joi.string().allow(null).optional(),
  group: Joi.string().allow(null).optional(),
  masteryRate: Joi.number().required().allow(null),
});

class CampaignParticipationInfo {
  constructor({
    participantFirstName,
    participantLastName,
    participantExternalId = null,
    studentNumber = null,
    userId,
    campaignParticipationId,
    isCompleted,
    createdAt,
    sharedAt,
    division,
    group,
    masteryRate,
  } = {}) {
    this.participantFirstName = participantFirstName;
    this.participantLastName = participantLastName;
    this.participantExternalId = participantExternalId;
    this.studentNumber = studentNumber;
    this.userId = userId;
    this.campaignParticipationId = campaignParticipationId;
    this.isCompleted = isCompleted;
    this.createdAt = createdAt;
    this.sharedAt = sharedAt;
    this.division = division;
    this.group = group;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;
    validateEntity(validationSchema, this);
  }

  get isShared() {
    return Boolean(this.sharedAt);
  }
}

module.exports = CampaignParticipationInfo;
