// App root

import { DictionaryManager, DictionaryManagerInterface } from './dictonaries/dictionary-manager';

const manager: DictionaryManagerInterface = new DictionaryManager({
  useLoader: 'http'
});

manager.loads().subscribe(resp => {
  console.log(resp);
}, error => {
  console.log(error);
});
