import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  redirect() {
    this.replaceWith('authenticated.campaigns.participant-assessment.results');
  }
}
