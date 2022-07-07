import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProfilesCollectionRoute extends Route.extend(SecuredRouteMixin) {
  @service store;

  async model() {
    const campaign = this.modelFor('campaigns');
    const campaignParticipation = await this.store.queryRecord('campaignParticipation', {
      campaignId: campaign.id,
      userId: this.currentUser.user.id,
    });
    return {
      campaign,
      campaignParticipation,
    };
  }
}
