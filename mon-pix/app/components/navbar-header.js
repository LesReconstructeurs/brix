import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class NavbarHeader extends Component {
  @service url;

  get isFrenchDomainExtension() {
    //PATCH BRIX FRENCH DOMAIN DISPLAY
    return false;
    //return this.url.isFrenchDomainExtension;
  }
}
