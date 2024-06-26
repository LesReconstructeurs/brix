import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session-finalization-step-container', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // when
    const screen = await render(hbs`
      <SessionFinalizationStepContainer @title="Étape 1 : title">
        template block text
      </SessionFinalizationStepContainer>
    `);

    // then
    assert.dom(screen.getByText('Étape 1 : title')).exists();
    assert.dom(screen.getByText('template block text')).exists();
  });
});
