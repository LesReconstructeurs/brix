module.exports = async function updateParticipantExternalId({
  campaignParticipationId,
  participantExternalId,
  participationsForCampaignManagementRepository,
}) {
  await participationsForCampaignManagementRepository.updateParticipantExternalId({
    campaignParticipationId,
    participantExternalId,
  });
};
