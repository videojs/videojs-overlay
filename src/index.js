import videojs from 'video.js';
import OverlayPlugin from './plugin';
import {version as VERSION} from '../package.json';

OverlayPlugin.VERSION = VERSION;

videojs.registerPlugin('overlay', OverlayPlugin);

export default OverlayPlugin;
