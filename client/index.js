import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap_svg.js';
require('babel-polyfill');
require('./dum-core/dum');
require('./dum-core/router');
require('./dum-core/factories/service');
require('./dum-core/factories/component');
require('./dum-core/factories/behavior');
require('./dum-core/elements');
require('./dum-core/config');
require('./app/config');
require('./app/behaviors/on-in-view');
require('./app/routes');