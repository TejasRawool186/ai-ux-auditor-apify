#!/usr/bin/env node

// Build verification script
console.log('🔍 Verifying build...');

// Check Node.js version
const nodeVersion = process.version;
const requiredVersion = 'v20.0.0';
console.log(`📦 Node.js version: ${nodeVersion}`);

if (nodeVersion < requiredVersion) {
    console.error(`❌ Node.js ${requiredVersion}+ required, found ${nodeVersion}`);
    process.exit(1);
}

// Check if all required files exist
import { existsSync } from 'fs';

const requiredFiles = [
    'package.json',
    'src/main.js',
    '.actor/actor.json',
    '.actor/input_schema.json',
    'Dockerfile'
];

let allFilesExist = true;
for (const file of requiredFiles) {
    if (existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.error(`❌ Missing: ${file}`);
        allFilesExist = false;
    }
}

if (!allFilesExist) {
    console.error('❌ Build verification failed - missing files');
    process.exit(1);
}

// Check syntax without running the actor
try {
    console.log('🔍 Checking syntax...');
    const { execSync } = await import('child_process');
    execSync('node --check src/main.js', { stdio: 'pipe' });
    console.log('✅ Syntax check passed');
} catch (error) {
    console.error('❌ Syntax error:', error.message);
    process.exit(1);
}

console.log('🎉 Build verification successful!');