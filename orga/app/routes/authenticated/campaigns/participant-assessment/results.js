import Route from '@ember/routing/route';

export default class ResultsRoute extends Route {
  model() {
    const { campaignAssessmentParticipation } = this.modelFor('authenticated.campaigns.participant-assessment');
    return campaignAssessmentParticipation;
  }
}
