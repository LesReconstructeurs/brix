import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationLearner::Activity', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#Empty state', function () {
    test('it should display the empty state when no participations', async function (assert) {
      // given
      const participations = [];
      this.set('participations', participations);

      // when
      await render(hbs`<OrganizationLearner::Activity @participations={{this.participations}} />`);

      // then
      assert.contains(
        this.intl.t('pages.organization-learner.activity.empty-state', {
          organizationLearnerFirstName: 'Jacques',
          organizationLearnerLastName: 'Chirac',
        })
      );
    });

    test('it should not display the empty state when there is participations', async function (assert) {
      // given
      const participations = [
        {
          campaignType: 'ASSESSMENT',
          campaignName: 'Ma 1ère campagne',
          createdAt: '2022-12-12',
          sharedAt: '2022-12-25',
          status: 'SHARED',
        },
      ];
      this.set('participations', participations);

      // when
      await render(hbs`<OrganizationLearner::Activity @participations={{this.participations}} />`);

      // then
      assert.notContains(
        this.intl.t('pages.organization-learner.activity.empty-state', {
          organizationLearnerFirstName: 'Jacques',
          organizationLearnerLastName: 'Chirac',
        })
      );
    });
  });
});