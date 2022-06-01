const { PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3, PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } =
  require('../models/Badge').keys;

const complementaryCertificationStatus = {
  ACQUIRED: 'Validée',
  REJECTED: 'Rejetée',
};

const complementaryCertificationLabel = {
  [PIX_EMPLOI_CLEA_V1]: 'CléA Numérique',
  [PIX_EMPLOI_CLEA_V2]: 'CléA Numérique',
  [PIX_EMPLOI_CLEA_V3]: 'CléA Numérique',
  [PIX_DROIT_MAITRE_CERTIF]: 'Pix+ Droit Maître',
  [PIX_DROIT_EXPERT_CERTIF]: 'Pix+ Droit Expert',
};

class ComplementaryCertificationCourseResultsForJuryCertification {
  constructor({ id, partnerKey, acquired }) {
    this.id = id;
    this.partnerKey = partnerKey;
    this.acquired = acquired;
  }

  get status() {
    return this.acquired ? complementaryCertificationStatus.ACQUIRED : complementaryCertificationStatus.REJECTED;
  }

  get label() {
    return complementaryCertificationLabel[this.partnerKey];
  }
}

ComplementaryCertificationCourseResultsForJuryCertification.statuses = complementaryCertificationStatus;
ComplementaryCertificationCourseResultsForJuryCertification.labels = complementaryCertificationLabel;

module.exports = ComplementaryCertificationCourseResultsForJuryCertification;