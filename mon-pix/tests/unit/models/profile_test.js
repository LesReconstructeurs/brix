import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Profile model', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const model = store.createRecord('profile');
    assert.ok(model);
  });

  module('@areas', function () {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/require-expect
    test('should return an array of unique areas code', function (assert) {
      return run(() => {
        // given
        const area1 = store.createRecord('area', { code: 1 });
        const area2 = store.createRecord('area', { code: 2 });

        const scorecard1 = store.createRecord('scorecard', { area: area1 });
        const scorecard2 = store.createRecord('scorecard', { area: area1 });
        const scorecard3 = store.createRecord('scorecard', { area: area2 });

        const model = store.createRecord('profile');
        model.scorecards = [scorecard1, scorecard2, scorecard3];

        // when
        const areas = model.areas;

        // then
        assert.deepEqual(
          areas.map((area) => area.get('code')),
          [1, 2]
        );
      });
    });
  });
});
