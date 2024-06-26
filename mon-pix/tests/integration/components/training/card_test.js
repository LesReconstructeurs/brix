import { module, test } from 'qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Training | Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders component', async function (assert) {
    // given
    this.set('training', {
      title: 'Mon super training',
      link: 'https://training.net/',
      type: 'webinaire',
      locale: 'fr-fr',
      duration: { hours: 6 },
      editorName: "Ministère de l'éducation nationale et de la jeunesse",
      editorLogoUrl:
        'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
    });

    // when
    await render(hbs`<Training::Card @training={{this.training}} />`);

    // then
    assert.dom('.training-card').exists();
    assert.strictEqual(find('.training-card__content').href, 'https://training.net/');
    assert.strictEqual(find('.training-card-content__title').textContent.trim(), 'Mon super training');
    assert.dom('.training-card-content__infos').exists();
    assert.strictEqual(find('.training-card-content-infos-list__type').textContent.trim(), 'Webinaire');
    assert.strictEqual(find('.training-card-content-infos-list__duration').textContent.trim(), '6h');
    assert.notOk(find('.training-card-content-illustration__image').alt);
    assert.strictEqual(
      find('.training-card-content-illustration__logo').alt,
      "Ministère de l'éducation nationale et de la jeunesse"
    );
    assert.strictEqual(
      find('.training-card-content-illustration__logo').src,
      'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg'
    );
  });
});
