
import { BricksetProvider } from '../lib/providers/brickset';

const BRICKSET_KEY = '3-wQGU-xXrU-Ej46o';

async function run() {
  console.log('Testing Brickset Provider: searchSets');
  const provider = new BricksetProvider(BRICKSET_KEY);
  
  try {
    console.log('Searching for "71374"...');
    const results = await provider.searchSets('71374');
    
    console.log(`Found ${results.length} results.`);
    if (results.length > 0) {
      console.log('First result:', JSON.stringify(results[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

run();

