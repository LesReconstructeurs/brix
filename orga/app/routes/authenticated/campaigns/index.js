import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  beforeModel() {
    return this.replaceWith('authenticated.campaigns.list.my-campaigns');
  }
}
