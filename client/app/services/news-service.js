import {HTTP} from './http-service';
import {DUM} from '../../dum-core/dum';

export const News = DUM.Service('News', {});

Object.defineProperties(News, {
  get: {
    value: () => HTTP.get('article')
  }
});