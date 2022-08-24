class ScoOrganizationParticipant {
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    userId,
    username,
    email,
    isAuthenticatedFromGAR,
    division,
    participationCount,
    lastParticipationDate,
    campaignName,
    campaignType,
    participationStatus,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.isAuthenticatedFromGAR = isAuthenticatedFromGAR;
    this.division = division;
    this.participationCount = participationCount;
    this.lastParticipationDate = lastParticipationDate;
    this.campaignName = campaignName;
    this.campaignType = campaignType;
    this.participationStatus = participationStatus;
  }
}

module.exports = ScoOrganizationParticipant;