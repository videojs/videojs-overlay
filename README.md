# Video.js Overlay

[![Build Status](https://travis-ci.org/brightcove/videojs-overlay.svg?branch=master)](https://travis-ci.org/brightcove/videojs-overlay)

A plugin to display simple overlays during video playback.

## Getting Started

Once you've added the plugin script to your page, you can use it with any video:

```html
<script src="videojs-overlay"></script>
<script>
  videojs(document.querySelector('video')).overlay();
</script>
```

There's also a [working example](example.html) of the plugin you can check out if you're having trouble.

## Documentation
### Plugin Options

You may pass in an options object to the plugin upon initialization. This
object may contain any of the following properties:

#### content
Type: `string` or `object`
Default: "This overlay will show up while the video is playing"

The default HTML that the overlay wraps. Specifying `content` in an overlay object overrides this setting.

#### overlays
Type: `array`
Default: an array with a single example overlay

An array of the overlay objects. An overlay object may consist of a few properties:

 - `start` (string or number): when to show the overlay. If its value is a string, it is interpreted as the name of an event. If it is a number, the overlay will be shown when that moment in the playback timeline is passed.
 - `end` (string or number): when to hide the overlay. The values of this property have the same semantics as `start`.
 - `content` (string or DOM object): the HTML that the overlay will contain. You can pass in a string, an HTML element, or a DocumentFragment.
 - `align` (string): where to show the overlay. If you include the default stylesheet, the following values are supported: `top-left`, `top`, `top-right`, `right`, `bottom-right`, `bottom`, `bottom-left`, `left`.

All properties are optional but you may get weird results if you don't include at least a `start` and `end`.

### Examples
You can setup overlays to be displayed when particular events are emitted by the player, including your own custom events:

```javascript
player.overlay({
  overlays: [{
    start: 'playing',
    end: 'pause'
  }, {
    start: 'custom1',
    end: 'custom2'
  }]
});
```

Multiple overlays can be displayed simultaneously. You probably want to specify an alignment for one or more of them so they don't overlap:

```javascript
player.overlay({
  overlays: [{
    start: 3,
    end: 15
  }, {
    start: 7,
    end: 22,
    align: 'bottom'
  }]
});
```

## Release History

 - 0.1.0: Initial release
