
import { BricksetProvider } from '../lib/providers/brickset';

const BRICKSET_KEY = '3-wQGU-xXrU-Ej46o';

async function run() {
  console.log('Testing Brickset Provider: getSetByNumber');
  const provider = new BricksetProvider(BRICKSET_KEY);
  
  try {
    console.log('Looking up set "71374" (Nintendo Entertainment System)...');
    const result = await provider.getSetByNumber('71374');
    
    if (result) {
      console.log('SUCCESS! Found set:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('FAILURE: Set not found via getSetByNumber.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

run();

