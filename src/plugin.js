import videojs from 'video.js';

const defaults = {
  content: 'This overlay will show up while the video is playing',
  overlays: [{
    start: 'playing',
    end: 'paused'
  }]
};

/**
 * Shows an overlay.
 *
 * @param  {Player} player
 * @param  {Object} overlay
 */
const showOverlay = (player, overlay) => {
  let el = document.createElement('div');
  let settings = player.overlay_.settings;
  let content = overlay.content || settings.content || '';
  let align = settings.align || overlay.align || 'top-left';
  let customClass = settings.class || overlay.class;

  videojs.addClass(el, 'vjs-overlay');

  if (align) {
    videojs.addClass(el, `vjs-overlay-${align}`);
  }

  if (customClass) {
    videojs.addClass(el, customClass);
  }

  if (typeof content === 'string') {
    el.innerHTML = content;
  } else {
    el.appendChild(content);
  }

  overlay.el = el;
  player.el().appendChild(el);
};

/**
 * Function which handles any type of player event to show any
 * associated overlay(s).
 *
 * @param  {Event} event
 */
const showOverlayListener = function(event) {
  this.overlay_.byEvent[event.type].forEach(overlay => {
    if (!overlay.el) {
      showOverlay(this, overlay);
    }
  }, this);
};

/**
 * Hides an overlay.
 *
 * @param  {Player} player
 * @param  {Object} overlay
 */
const hideOverlay = (player, overlay) => {
  if (overlay.el) {
    overlay.el.parentNode.removeChild(overlay.el);
    overlay.el = null;
  }
};

/**
 * Function which handles any type of player event to remove any
 * associated overlay(s).
 *
 * @param  {Event} event
 */
const hideOverlayListener = function(event) {
  this.overlay_.byEvent[event.type].forEach(overlay => {
    if (overlay.el) {
      hideOverlay(this, overlay);
    }
  }, this);
};

// returns a listener function that executes a callback when
// the specified property of one of the overlays is positive
// comapred with the current playback time (compareFunction == true)

/**
 * Creates a timeupdate listener on a player.
 *
 * @param {Player}   player
 * @param {String}   property
 * @param {Function} callback
 * @param {Function} comparator
 */
const createTimeupdateListener = (player, property, callback, comparator) => {
  const overlays = player.overlay_.byTime[property];
  let lastTime = 0;
  let earliest = 0;

  player.overlay_.addListener('timeupdate', () => {
    let overlay = overlays[earliest];
    let time = player.currentTime();

    // Check if we've seeked backwards and rewind the earliest showing
    // overlay as a result.
    if (lastTime > time) {
      earliest = 0;
      overlay = overlays[earliest];
    }

    while (overlay && comparator(overlay[property], time)) {

      // Don't re-show overlays that are already showing. Fixes #8.
      if (!overlay.el) {
        callback(player, overlay);
      }
      overlay = overlays[++earliest];
    }

    lastTime = time;
  });
};

/**
 * Will de-initialize the plugin on a player.
 *
 * @param  {Player} player
 */
const teardown = (player) => {
  player.overlay_.listeners.forEach(listener => {
    player.off(listener.type, listener.fn);
  });
};

/**
 * The plugin.
 *
 * @function plugin
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const plugin = function(options) {
  if (this.overlay_) {
    teardown(this);
  }

  let settings = videojs.mergeOptions(defaults, options);

  this.overlay_ = {

    addListener: (type, fn) => {
      this.on(type, fn);
      this.overlay_.listeners.push({type, fn});
    },

    byEvent: {},

    byTime: {
      end: settings.overlays
        .filter(o => Number.isInteger(o.end))
        .sort((left, right) => left.end - right.end),
      start: settings.overlays
        .filter(o => Number.isInteger(o.start))
        .sort((left, right) => left.start - right.start)
    },

    listeners: [],
    settings
  };

  // Look for overlays that `start` or `end` on an event (represented by
  // a string value).
  settings.overlays.forEach(overlay => {
    ['start', 'end'].forEach(key => {
      let value = overlay[key];

      if (typeof value !== 'string') {
        return;
      }

      // Create an array to store overlays by event type and add a listener
      // for that event type, so that it is only bound once.
      if (!this.overlay_.byEvent[value]) {
        this.overlay_.byEvent[value] = [];
        this.overlay_.addListener(
          value,
          key === 'start' ? showOverlayListener : hideOverlayListener
        );
      }

      this.overlay_.byEvent[value].push(overlay);
    });
  });

  createTimeupdateListener(this, 'start', showOverlay, (value, time) => value <= time);
  createTimeupdateListener(this, 'start', hideOverlay, (value, time) => value > time);
  createTimeupdateListener(this, 'end', hideOverlay, (value, time) => value <= time);
};

videojs.plugin('overlay', plugin);

export default plugin;
