/*! videojs-overlay - v0.0.0 - 2014-4-26
 * Copyright (c) 2014 Brightcove
 * Licensed under the Apache-2.0 license. */
(function(window, videojs, qunit) {
  'use strict';

  var realIsHtmlSupported,
      player,

      currentTime = 0,
      // simulate the video element playing to the specified time
      updateTime = function(seconds) {
        currentTime = seconds;
        player.trigger('timeupdate');
      },

      // local QUnit aliases
      // http://api.qunitjs.com/

      // module(name, {[setup][ ,teardown]})
      module = qunit.module,
      // test(name, callback)
      test = qunit.test,
      // ok(value, [message])
      ok = qunit.ok,
      // equal(actual, expected, [message])
      equal = qunit.equal,
      // strictEqual(actual, expected, [message])
      strictEqual = qunit.strictEqual,
      // deepEqual(actual, expected, [message])
      deepEqual = qunit.deepEqual,
      // notEqual(actual, expected, [message])
      notEqual = qunit.notEqual,
      // throws(block, [expected], [message])
      throws = qunit.throws;

  module('videojs-overlay', {
    setup: function() {
      // force HTML support so the tests run in a reasonable
      // environment under phantomjs
      realIsHtmlSupported = videojs.Html5.isSupported;
      videojs.Html5.isSupported = function() {
        return true;
      };

      // create a video element
      var video = document.createElement('video');
      document.querySelector('#qunit-fixture').appendChild(video);

      // create a video.js player
      player = videojs(video);
      player.currentTime = function() {
        return currentTime;
      };

      // initialize the plugin with the default options
      player.overlay();
    },
    teardown: function() {
      videojs.Html5.isSupported = realIsHtmlSupported;
    }
  });

  test('registers itself', function() {
    ok(player.overlay, 'registered the plugin');
  });

  test('does not display overlays when none are configured', function() {
    player.overlay({
      overlays: []
    });

    strictEqual(player.el().querySelector('.vjs-overlay'), null, 'no overlay present');
  });

  test('can be triggered and dismissed by events', function() {
    player.overlay({
      overlays: [{
        start: 'custom-start',
        end: 'custom-end'
      }]
    });

    strictEqual(player.el().querySelector('.vjs-overlay'),
                null,
                'waits for the start event');

    player.trigger('custom-start');
    ok(player.el().querySelector('.vjs-overlay'), 'shows after the start event');

    player.trigger('custom-end');
    strictEqual(player.el().querySelector('.vjs-overlay'),
                null,
                'removes the overlay at the end event');
  });

  test('can be triggered for time intervals', function() {
    player.overlay({
      overlays: [{
        start: 5,
        end: 10
      }]
    });

    updateTime(4);
    strictEqual(player.el().querySelector('.vjs-overlay'), null, 'waits for the start time');

    updateTime(5);
    ok(player.el().querySelector('.vjs-overlay'), 'shows at the start time');

    updateTime(7.5);
    ok(player.el().querySelector('.vjs-overlay'),
       'remains showing as the video plays');

    updateTime(10);
    strictEqual(player.el().querySelector('.vjs-overlay'),
                null,
                'removes at the end time');

    updateTime(11);
    strictEqual(player.el().querySelector('.vjs-overlay'),
                null,
                'stays away after the end time');

    updateTime(6);
    ok(player.el().querySelector('.vjs-overlay'),
       'shows the overlay again');

    updateTime(12);
    ok(!player.el().querySelector('.vjs-overlay'),
       'hides the overlay again');
  });

  test('shows multiple overlays simultaneously', function() {
    player.overlay({
      overlays: [{
        start: 3,
        end: 10
      }, {
        start: 'playing',
        end: 'ended'
      }]
    });

    updateTime(4);
    strictEqual(player.el().querySelectorAll('.vjs-overlay').length,
                1,
                'shows one overlay');

    player.trigger('playing');
    strictEqual(player.el().querySelectorAll('.vjs-overlay').length,
                2,
                'shows two overlays');

    player.trigger('ended');
    strictEqual(player.el().querySelectorAll('.vjs-overlay').length,
                1,
                'shows one overlay');

    updateTime(11);
    strictEqual(player.el().querySelectorAll('.vjs-overlay').length,
                0,
                'shows no overlays');
  });

  test('the content of overlays can be specified as an HTML string', function() {
    var innerHTML = '<p>overlay <a href="#">text</a></p>';
    player.overlay({
      content: innerHTML,
      overlays: [{
        start: 'playing',
        end: 'ended'
      }]
    });

    player.trigger('playing');
    strictEqual(player.el().querySelector('.vjs-overlay').innerHTML,
                innerHTML,
                'HTML matched');
  });

  test('an element can be used as the content of overlays', function() {
    var content = document.createElement('p');
    content.innerHTML = 'this is some text';
    player.overlay({
      content: content,
      overlays: [{
        start: 5,
        end: 10
      }]
    });

    updateTime(5);
    ok(player.el().querySelector('.vjs-overlay p'), 'sets the content element');
  });

  test('a DocumentFragment can be used as the content of overlays', function() {
    var fragment = document.createDocumentFragment();
    fragment.appendChild(document.createElement('br'));
    player.overlay({
      content: fragment,
      overlays: [{
        start: 'showoverlay',
        end: 'hideoverlay'
      }]
    });

    player.trigger('showoverlay');
    ok(player.el().querySelector('.vjs-overlay br'), 'sets the content fragment');
  });

  test('allows content to be specified per overlay', function() {
    var text = '<b>some text</b>',
        html = '<p>overlay <a href="#">text</a></p>',
        element = document.createElement('i'),
        fragment = document.createDocumentFragment();
    fragment.appendChild(document.createElement('img'));
    player.overlay({
      content: text,
      overlays: [{
        start: 0,
        end: 1
      },{
        content: html,
        start: 0,
        end: 1
      }, {
        content: element,
        start: 0,
        end: 1
      }, {
        content: fragment,
        start: 0,
        end: 1
      }]
    });

    updateTime(0);
    strictEqual(player.el().querySelectorAll('.vjs-overlay').length,
                4,
                'shows three overlays');
    strictEqual(player.el().querySelectorAll('.vjs-overlay b').length,
                1,
                'shows a default overlay');
    strictEqual(player.el().querySelectorAll('.vjs-overlay p').length,
                1,
                'shows an HTML string');
    strictEqual(player.el().querySelectorAll('.vjs-overlay i').length,
                1,
                'shows a DOM element');
    strictEqual(player.el().querySelectorAll('.vjs-overlay img').length,
                1,
                'shows a document fragment');
  });

  test('does not double add overlays that are triggered twice', function() {
    player.overlay({
      overlays: [{
        start: 'start',
        end: 'end'
      }]
    });

    player.trigger('start');
    player.trigger('start');
    strictEqual(player.el().querySelectorAll('.vjs-overlay').length,
                1,
                'shows one overlay');
  });

  test('does not double remove overlays that are triggered twice', function() {
    player.overlay({
      overlays: [{
        start: 'start',
        end: 'end'
      }]
    });

    player.trigger('start');
    player.trigger('end');
    player.trigger('end');
    strictEqual(player.el().querySelectorAll('.vjs-overlay').length,
                0,
                'overlay is removed');
  });

  test('displays overlays that mix event and playback time triggers', function() {
    player.overlay({
      overlays: [{
        start: 'start',
        end: 10
      }, {
        start: 5,
        end: 'end'
      }]
    });

    player.trigger('start');
    strictEqual(player.el().querySelectorAll('.vjs-overlay').length,
                1,
                'displays the event started overlay');
    updateTime(6);
    strictEqual(player.el().querySelectorAll('.vjs-overlay').length,
                2,
                'displays the time started overlay');
    updateTime(10);
    strictEqual(player.el().querySelectorAll('.vjs-overlay').length,
                1,
                'removes the time ended overlay');
    player.trigger('end');
    ok(!player.el().querySelector('.vjs-overlay'),
       'removes the time ended overlay');
  });

  test('shows mixed trigger overlays once per seek', function() {
    player.overlay({
      overlays: [{
        start: 1,
        end: 'pause'
      }]
    });

    updateTime(1);
    ok(player.el().querySelector('.vjs-overlay'), 'shows the overlay');
    player.trigger('pause');
    ok(!player.el().querySelector('.vjs-overlay'), 'hides the overlay');
    updateTime(2);
    ok(!player.el().querySelector('.vjs-overlay'), 'keeps the overlay hidden');

    updateTime(1);
    ok(player.el().querySelector('.vjs-overlay'), 'shows the overlay');
    player.trigger('pause');
    ok(!player.el().querySelector('.vjs-overlay'), 'hides the overlay');
    updateTime(2);
    ok(!player.el().querySelector('.vjs-overlay'), 'keeps the overlay hidden');
  });

  test('applies simple alignment class names', function() {
    player.overlay({
      overlays: [{
        start: 'start',
        align: 'top'
      }, {
        start: 'start',
        align: 'left'
      }, {
        start: 'start',
        align: 'right'
      }, {
        start: 'start',
        align: 'bottom'
      }]
    });

    player.trigger('start');
    ok(player.el().querySelector('.vjs-overlay.vjs-overlay-top'),
       'applies top class');
    ok(player.el().querySelector('.vjs-overlay.vjs-overlay-right'),
       'applies right class');
    ok(player.el().querySelector('.vjs-overlay.vjs-overlay-bottom'),
       'applies bottom class');
    ok(player.el().querySelector('.vjs-overlay.vjs-overlay-left'),
       'applies left class');
  });

  test('applies compound alignment class names', function() {
    player.overlay({
      overlays: [{
        start: 'start',
        align: 'top-left'
      }, {
        start: 'start',
        align: 'top-right'
      }, {
        start: 'start',
        align: 'bottom-left'
      }, {
        start: 'start',
        align: 'bottom-right'
      }]
    });

    player.trigger('start');
    ok(player.el().querySelector('.vjs-overlay.vjs-overlay-top-left'),
       'applies top class');
    ok(player.el().querySelector('.vjs-overlay.vjs-overlay-top-right'),
       'applies right class');
    ok(player.el().querySelector('.vjs-overlay.vjs-overlay-bottom-left'),
       'applies bottom class');
    ok(player.el().querySelector('.vjs-overlay.vjs-overlay-bottom-right'),
       'applies left class');
  });
})(window, window.videojs, window.QUnit);
