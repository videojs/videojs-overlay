<a name="2.1.1"></a>
## [2.1.1](https://github.com/brightcove/videojs-overlay/compare/v2.1.0...v2.1.1) (2018-07-05)

### Chores

* update to generator v6 (#63) ([4ac2452](https://github.com/brightcove/videojs-overlay/commit/4ac2452)), closes [#63](https://github.com/brightcove/videojs-overlay/issues/63)

<a name="2.1.0"></a>
# [2.1.0](https://github.com/brightcove/videojs-overlay/compare/v2.0.0...v2.1.0) (2018-04-20)

### Features

* Allow choosing the placement of overlay elements in the control bar. ([b8b0607](https://github.com/brightcove/videojs-overlay/commit/b8b0607))

### Bug Fixes

* Upgrade rollup to v0.52.x to fix build failures ([#60](https://github.com/brightcove/videojs-overlay/issues/60)) ([b0b3a5d](https://github.com/brightcove/videojs-overlay/commit/b0b3a5d))

<a name="2.0.0"></a>
# [2.0.0](https://github.com/brightcove/videojs-overlay/compare/v1.1.3...v2.0.0) (2017-08-24)

### Features

* Fix vertical centre alignment and add align-center ([#38](https://github.com/brightcove/videojs-overlay/issues/38)) ([8649210](https://github.com/brightcove/videojs-overlay/commit/8649210))

### Bug Fixes

* Fix malformed README link ([#43](https://github.com/brightcove/videojs-overlay/issues/43)) ([c2b1315](https://github.com/brightcove/videojs-overlay/commit/c2b1315))
* remove global browserify transforms, so parent packages don't break ([#48](https://github.com/brightcove/videojs-overlay/issues/48)) ([aa74853](https://github.com/brightcove/videojs-overlay/commit/aa74853))

### Code Refactoring

* Update to use generator v5 tooling. ([#51](https://github.com/brightcove/videojs-overlay/issues/51)) ([bfeff8c](https://github.com/brightcove/videojs-overlay/commit/bfeff8c))

## 1.1.4 (2017-04-03)
* fix: remove global browserify transforms, so parent packages don't break

## 1.1.3 (2017-02-27)
* update travis to test vjs 5/6 (#46)

## 1.1.2 (2017-02-03)
* Added Video.js 5 and 6 cross-compatibility.

## 1.1.1 (2016-08-05)
* Fixed issue where max-width was being set on all overlays rather than only those showBackground=false.

## 1.1.0 (2016-07-27)
* Added showBackground option to show or hide the overlay background.
* Added attachToControlBar option to allow bottom align control bars to move when the control bar minimizes.

## 1.0.2 (2016-06-10)
_(none)_

## 1.0.1 (2016-03-08)
* Fixed #22, should not have been checking for integers only.

## 1.0.0 (2016-02-12)
* Major refactoring of plugin to align with generator-videojs-plugin standards.
* Fixed significant edge-case issues with creation/destruction of overlays.

## 0.1.0 (2014-04-29)
* Initial release
