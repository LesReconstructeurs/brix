import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CampaignsAssessmentTutorial extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service intl;

  campaignCode = null;
  tutorialPageId = 0;
  tutorialPageCount = 5;

  _setupPaging(numberOfPages, currentTutorialPageId) {
    const classOfTutorialPages = new Array(numberOfPages);
    classOfTutorialPages[currentTutorialPageId] = 'dot__active';
    return classOfTutorialPages;
  }

  model() {
    this.campaignCode = this.paramsFor('campaigns').code;
    return {
      title: this.intl.t(`pages.tutorial.pages.page${this.tutorialPageId}.title`),
      icon: this.intl.t(`pages.tutorial.pages.page${this.tutorialPageId}.icon`),
      explanation: this.intl.t(`pages.tutorial.pages.page${this.tutorialPageId}.explanation`),
      showNextButton: this.tutorialPageId < this.tutorialPageCount - 1,
      paging: this._setupPaging(this.tutorialPageCount, this.tutorialPageId),
    };
  }

  @action
  async submit() {
    await this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenAssessmentInstructions: true } });

    this.tutorialPageId = 0;
    this.transitionTo('campaigns.assessment.start-or-resume', this.campaignCode, {
      queryParams: {
        hasConsultedTutorial: true,
      },
    });
  }

  @action
  next() {
    const nextTutorialPageId = this.tutorialPageId + 1;
    if (nextTutorialPageId < this.tutorialPageCount) {
      this.tutorialPageId = nextTutorialPageId;
      this.refresh();
    }
  }
}
