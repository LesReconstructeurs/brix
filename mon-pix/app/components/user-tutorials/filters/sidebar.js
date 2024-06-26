import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

class Filters {
  @tracked competences = A([]);
}

export default class Sidebar extends Component {
  @tracked filters = new Filters();

  get sortedAreas() {
    return this.args.areas?.sortBy('code');
  }

  @action
  handleFilterChange(type, id) {
    if (!this.filters[type].includes(id)) {
      this.filters[type].pushObject(id);
    } else {
      this.filters[type].removeObject(id);
    }
  }

  @action
  handleResetFilters() {
    this.filters = new Filters();
  }
}
