// App root
import { Morph, MorphInterface } from './morph/morph';

const morph: MorphInterface = new Morph({
  dictionary: {
    useLoader: 'http'
  }
});

morph.init().subscribe(resp => {
  console.log(resp);
}, error => {
  console.log(error);
});
