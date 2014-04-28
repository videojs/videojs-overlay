/*! videojs-overlay - v0.0.0 - 2014-4-26
 * Copyright (c) 2014 Brightcove
 * Licensed under the Apache-2.0 license. */
(function(window, videojs) {
  'use strict';

  var defaults = {
        content: 'This overlay will show up while the video is playing',
        overlays: [{
          start: 'playing',
          end: 'paused'
        }]
      },
      // comparator function to sort overlays by start time
      ascendingByStart = function(left, right) {
        return left.start - right.start;
      },
      // comparator function to sort overlays by end time
      ascendingByEnd = function(left, right) {
        return left.end - right.end;
      },

      showOverlay,
      hideOverlay,
      init;

  showOverlay = function(player, settings, overlay) {
    // create the overlay wrapper
    var el = document.createElement('div'),
        content = overlay.content || settings.content,
        align = settings.align || overlay.align;
    el.className = 'vjs-overlay';
    overlay.el = el;

    // if an alignment was specified, add the appropriate class
    if (align) {
      el.className += ' vjs-overlay-' + align;
    }

    // append the content
    if (typeof content === 'string') {
      el.innerHTML = content;
    } else {
      el.appendChild(content);
    }

    // add the overlay to the player
    player.el().appendChild(el);
  };
  hideOverlay = function(overlay) {
    overlay.el.parentNode.removeChild(overlay.el);
    delete overlay.el;
  };

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  init = function(options) {
    var settings = videojs.util.mergeOptions(defaults, options),
        player = this,
        events = {},
        startTimes = [],
        endTimes = [],

        showOverlayListener = function(event) {
          var overlays = events[event.type],
              i = overlays.length,
              overlay;
          while (i--) {
            overlay = overlays[i];
            if (overlay.el) {
              // overlay is already showing, do nothing
              continue;
            }
            showOverlay(player, settings, overlay);
          }
        },
        hideOverlayListener = function(event) {
          var overlays = events[event.type],
              i = overlays.length,
              overlay;
          while (i--) {
            overlay = overlays[i];
            if (!overlay.el) {
              // overlay is already showing, do nothing
              continue;
            }
              
            // remove the overlay
           hideOverlay(overlay);
          }
        },
        overlay,
        i;

    // cleanup listeners from previous invocations if necessary
    (function() {
      var listener, i;
      for (i in player.overlay.eventListeners) {
        listener = player.overlay.eventListeners[i];
        player.off(listener.type, listener.fn);
      }
    })();

    player.overlay.eventListeners = [];

    for (i in settings.overlays) {
      overlay = settings.overlays[i];

      // showing overlays
      if (typeof overlay.start === 'string') {
        // start on an event

        if (!events[overlay.start]) {
          events[overlay.start] = [];
          player.on(overlay.start, showOverlayListener);
          player.overlay.eventListeners.push({
            type: overlay.start,
            fn: showOverlayListener
          });
        }
        events[overlay.start].push(overlay);
      } else {
        // start at a time
        startTimes.push(overlay);
      }

      // hiding overlays
      if (typeof overlay.end === 'string') {
        // end on an event
        if (!events[overlay.end]) {
          events[overlay.end] = [];
          player.on(overlay.end, hideOverlayListener);
          player.overlay.eventListeners.push({
            type: overlay.end,
            fn: hideOverlayListener
          });
        }
        events[overlay.end].push(overlay);
      } else {
        // end at a time
        endTimes.push(overlay);
      }
    }

    // setup time-based overlay starts
    if (startTimes.length) {
      startTimes.sort(ascendingByStart);
      (function() {
        var lastTime = 0,
            earliestHidden = 0,
            listener;

        listener = function() {
          var overlay = startTimes[earliestHidden],
              time = player.currentTime();

          // check if we've seeked backwards and rewind the earliest
          // hidden overlay as a result
          if (lastTime > time) {
            earliestHidden = 0;
            overlay = startTimes[earliestHidden];
          }

          for (; overlay && overlay.start <= time;
               overlay = startTimes[++earliestHidden]) {
            showOverlay(player, settings, overlay);
          }
          lastTime = time;
        };
        player.on('timeupdate', listener);
        player.overlay.eventListeners.push({
          type: 'timeupdate',
          fn: listener
        });
      })();
    }

    // setup time-based overlay ends
    if (endTimes.length) {
      endTimes.sort(ascendingByEnd);
      (function() {
        var lastTime = 0,
            earliestShowing = 0,
            listener;

        listener = function() {
          var overlay = endTimes[earliestShowing],
              time = player.currentTime();

          // check if we've seeked backwards and rewind the earliest
          // showing overlay as a result
          if (lastTime > time) {
            earliestShowing = 0;
            overlay = endTimes[earliestShowing];
          }

          for (; overlay && overlay.el && overlay.end <= time;
               overlay = endTimes[++earliestShowing]) {
            hideOverlay(overlay);
          }
          lastTime = time;
        };
        player.on('timeupdate', listener);
        player.overlay.eventListeners.push({
          type: 'timeupdate',
          fn: listener
        });
      })();
    }
  };

  // register the plugin
  videojs.plugin('overlay', init);
})(window, window.videojs);
