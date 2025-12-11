// Simple test script to verify the actor works locally
import { Actor } from 'apify';

// Mock Actor.getInput() to return test input
const originalGetInput = Actor.getInput;
Actor.getInput = async () => {
    return {
        startUrls: [{ url: 'https://example.com' }],
        useFreeMode: true,
        analysisType: 'general',
        viewPort: 'desktop',
        maxConcurrency: 1
    };
};

// Import and run the main script
import('./src/main.js').then(() => {
    console.log('✅ Test completed successfully');
}).catch((error) => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
});