# Video.js Overlay

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

#### option
Type: `boolean`
Default: true

An example boolean option that has no effect.

## Release History

 - 0.1.0: Initial release
