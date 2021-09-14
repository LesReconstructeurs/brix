import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class Tooltip extends Component {
  @service currentUser;
  @tracked shouldDisplayTooltip = false;

  constructor() {
    super(...arguments);
    this._showTooltip();
  }

  get isFocusedChallenge() {
    return this.args.challenge.focused;
  }

  _showTooltip() {
    if (this.isFocusedChallenge && this._hasUserNotSeenFocusedChallengeTooltip()
      || !this.isFocusedChallenge && this._hasUserNotSeenOtherChallengesTooltip()) {
      this.shouldDisplayTooltip = true;
    } else {
      this.shouldDisplayTooltip = false;
      this._notifyChallengeTooltipIsClosed();
    }
  }

  @action
  displayTooltip(value) {
    if (this.isFocusedChallenge && this._hasUserSeenFocusedChallengeTooltip()) {
      this.shouldDisplayTooltip = value;
    } else if (!this.isFocusedChallenge && this._hasUserSeenOtherChallengesTooltip()) {
      this.shouldDisplayTooltip = value;
    } else if (!this._isUserConnected()) {
      this.shouldDisplayTooltip = value;
    }
  }

  get shouldDisplayButton() {
    if (this.isFocusedChallenge && this._hasUserNotSeenFocusedChallengeTooltip()) {
      return true;
    }
    else if (!this.isFocusedChallenge && this._hasUserNotSeenOtherChallengesTooltip()) {
      return true;
    }
    return false;
  }

  _hasUserSeenFocusedChallengeTooltip() {
    return this._isUserConnected() && this.currentUser.user.hasSeenFocusedChallengeTooltip;
  }

  _hasUserNotSeenFocusedChallengeTooltip() {
    return this._isUserConnected() && !this.currentUser.user.hasSeenFocusedChallengeTooltip;
  }

  _hasUserSeenOtherChallengesTooltip() {
    return this._isUserConnected() && this.currentUser.user.hasSeenOtherChallengesTooltip;
  }

  _hasUserNotSeenOtherChallengesTooltip() {
    return this._isUserConnected() && !this.currentUser.user.hasSeenOtherChallengesTooltip;
  }

  _isUserConnected() {
    return this.currentUser.user;
  }

  @action
  confirmInformationIsRead() {
    this.shouldDisplayTooltip = false;
    this._notifyChallengeTooltipIsClosed();
  }

  _notifyChallengeTooltipIsClosed() {
    this.args.onTooltipClose();
  }
}
