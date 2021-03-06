'use strict';
import {DUM}        from '../dum-core/dum';
import {artists}    from './components/artists-component';
import {news}       from './components/news-component';
import {multiMixer} from './components/multi-mixer';
import {mixingConsole} from './components/mixing-console-component';

/*======== ROUTES =======*/
DUM.Router
.addRoutes([
  {
    name: 'news',
    path: '/news',
    view: news
  },
  
  {
    name: 'artists',
    path: '/artists',
    view: artists
  },
  
  {
    name: 'create',
    path: '/create',
    view: multiMixer
  }, 

  {
    name: 'videos',
    path: '/videos',
    view: mixingConsole
  }
]);