import videojs from 'video.js';

const defaults = {
  align: 'top-left',
  class: '',
  content: 'This overlay will show up while the video is playing',
  overlays: [{
    start: 'playing',
    end: 'paused'
  }]
};

const Component = videojs.getComponent('Component');

/**
 * Whether the number is an integer.
 *
 * @param  {Number} n
 * @return {Boolean}
 */
const isInteger = n => n >= 0 && n % 1 === 0;

/**
 * Whether a value is a string with no whitespace.
 *
 * @param  {String} s
 * @return {Boolean}
 */
const hasNoWhitespace = s => typeof s === 'string' && (/^\S+$/).test(s);

/**
 * Overlay component.
 *
 * @class   Overlay
 * @extends {videojs.Component}
 */
class Overlay extends Component {

  constructor(player, options) {
    super(player, options);

    player.addChild(this);

    ['start', 'end'].forEach(key => {
      let value = this.options_[key];

      if (isInteger(value)) {
        this[key + 'Event_'] = 'timeupdate';
      } else if (hasNoWhitespace(value)) {
        this[key + 'Event_'] = value;

      // An overlay MUST have a start option. Otherwise, it's pointless.
      } else if (key === 'start') {
        throw new Error('invalid "start" option; expected number or string');
      }
    });

    // If the start event is a timeupdate, we need to watch for rewinds (i.e.,
    // when the user seeks backward).
    if (this.startEvent_ === 'timeupdate') {
      this.on(player, 'timeupdate', this.rewindListener_);
    }

    this.hide();
  }

  createEl() {
    let options = this.options_;
    let content = options.content;

    let el = videojs.createEl('div', {
      className: `vjs-overlay vjs-overlay-${options.align} ${options.class} vjs-hidden`
    });

    if (typeof content === 'string') {
      el.innerHTML = content;
    } else if (content instanceof DocumentFragment) {
      el.appendChild(content);
    } else {
      videojs.appendContent(el, content);
    }

    return el;
  }

  /**
   * Overrides the inherited method to perform some event binding
   *
   * @return {Overlay}
   */
  hide() {
    super.hide();

    // Overlays without an "end" are valid.
    if (this.endEvent_) {
      this.off(this.player(), this.endEvent_, this.endListener_);
    }

    this.on(this.player(), this.startEvent_, this.startListener_);

    return this;
  }

  /**
   * Determine whether or not the overlay should hide.
   *
   * @param  {Number} time
   *         The current time reported by the player.
   * @param  {String} type
   *         An event type.
   * @return {Boolean}
   */
  shouldHide_(time, type) {
    let end = this.options_.end;

    return isInteger(end) ? (time >= end) : end === type;
  }

  /**
   * Overrides the inherited method to perform some event binding
   *
   * @return {Overlay}
   */
  show() {
    super.show();
    this.off(this.player(), this.startEvent_, this.startListener_);

    // Overlays without an "end" are valid.
    if (this.endEvent_) {
      this.on(this.player(), this.endEvent_, this.endListener_);
    }

    return this;
  }

  /**
   * Determine whether or not the overlay should show.
   *
   * @param  {Number} time
   *         The current time reported by the player.
   * @param  {String} type
   *         An event type.
   * @return {Boolean}
   */
  shouldShow_(time, type) {
    let start = this.options_.start;
    let end = this.options_.end;

    if (isInteger(start)) {

      if (isInteger(end)) {
        return time >= start && time < end;

      // In this case, the start is a number and the end is a string. We need
      // to check whether or not the overlay has shown since the last seek.
      } else if (!this.hasShownSinceSeek_) {
        this.hasShownSinceSeek_ = true;
        return time >= start;
      }

      // In this case, the start is a number and the end is a string, but
      // the overlay has shown since the last seek. This means that we need
      // to be sure we aren't re-showing it at a later time than it is
      // scheduled to appear.
      return Math.floor(time) === start;
    }

    return start === type;
  }

  /**
   * Event listener that can trigger the overlay to show.
   *
   * @param  {Event} e
   */
  startListener_(e) {
    let time = this.player().currentTime();

    if (this.shouldShow_(time, e.type)) {
      this.show();
    }
  }

  /**
   * Event listener that can trigger the overlay to show.
   *
   * @param  {Event} e
   */
  endListener_(e) {
    let time = this.player().currentTime();

    if (this.shouldHide_(time, e.type)) {
      this.hide();
    }
  }

  /**
   * Event listener that can looks for rewinds - that is, backward seeks
   * and may hide the overlay as needed.
   *
   * @param  {Event} e
   */
  rewindListener_(e) {
    let time = this.player().currentTime();
    let previous = this.previousTime_;
    let start = this.options_.start;
    let end = this.options_.end;

    // Did we seek backward?
    if (time < previous) {

      // The overlay remains visible if two conditions are met: the end value
      // MUST be an integer and the the current time indicates that the
      // overlay should be visible.
      if (isInteger(end) && !this.shouldShow_(time)) {
        this.hasShownSinceSeek_ = false;
        this.hide();

      // If the end value is an event name, we cannot reliably decide if it
      // should still be displayed based solely on time; so, we can only queue
      // it up for showing if the seek took us to a point before the start
      // time.
      } else if (hasNoWhitespace(end) && time < start) {
        this.hasShownSinceSeek_ = false;
        this.hide();
      }
    }

    this.previousTime_ = time;
  }
}

videojs.registerComponent('Overlay', Overlay);

/**
 * Initialize the plugin.
 *
 * @function plugin
 * @param    {Object} [options={}]
 */
const plugin = function(options) {

  // De-initialize the plugin if it already has an array of overlays.
  if (Array.isArray(this.overlays_)) {
    this.overlays_.forEach(overlay => overlay.dispose());
  }

  const settings = videojs.mergeOptions(defaults, options);

  // We don't want to keep the original array of overlay options around
  // because it doesn't make sense to pass it to each Overlay component.
  const overlays = settings.overlays;

  delete settings.overlays;

  this.overlays_ = overlays.map(
    o => new Overlay(this, videojs.mergeOptions(settings, o))
  );
};

videojs.plugin('overlay', plugin);

export default plugin;
