/*! videojs-overlay - v0.0.0 - 2014-4-26
 * Copyright (c) 2014 Brightcove
 * Licensed under the Apache-2.0 license. */
(function(window, videojs) {
  'use strict';

  var defaults = {
        option: true
      },
      overlay;

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  overlay = function(options) {
    var settings = videojs.util.mergeOptions(defaults, options),
        player = this;

    // TODO: write some amazing plugin code
  };

  // register the plugin
  videojs.plugin('overlay', overlay);
})(window, window.videojs);
