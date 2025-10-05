const fs = require('fs');
const path = require('path');

console.log('\n================================');
console.log('  Configuration Checker');
console.log('================================\n');

let hasErrors = false;

// Check .env file
console.log('1. Checking .env file...');
if (fs.existsSync('.env')) {
  console.log('   ✓ .env file exists');
  
  const envContent = fs.readFileSync('.env', 'utf8');
  
  // Check MONGODB_URI
  if (envContent.includes('<db_password>')) {
    console.log('   ✗ MONGODB_URI still contains <db_password>');
    console.log('     Please replace it with your actual password');
    hasErrors = true;
  } else if (envContent.includes('MONGODB_URI=')) {
    console.log('   ✓ MONGODB_URI is configured');
  } else {
    console.log('   ✗ MONGODB_URI is missing');
    hasErrors = true;
  }
  
  // Check JWT_SECRET
  if (envContent.includes('JWT_SECRET=your_super_secret_jwt_key_change_this_in_production')) {
    console.log('   ⚠ JWT_SECRET is using default value (should change for production)');
  } else if (envContent.includes('JWT_SECRET=')) {
    console.log('   ✓ JWT_SECRET is configured');
  } else {
    console.log('   ✗ JWT_SECRET is missing');
    hasErrors = true;
  }
  
  // Check PORT
  if (envContent.includes('PORT=')) {
    console.log('   ✓ PORT is configured');
  }
  
} else {
  console.log('   ✗ .env file not found');
  console.log('     Please copy .env.example to .env and update values');
  hasErrors = true;
}

// Check node_modules
console.log('\n2. Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('   ✓ node_modules exists');
} else {
  console.log('   ✗ node_modules not found');
  console.log('     Please run: npm install');
  hasErrors = true;
}

// Check required directories
console.log('\n3. Checking project structure...');
const requiredDirs = ['config', 'controllers', 'middleware', 'models', 'routes'];
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   ✓ ${dir}/ directory exists`);
  } else {
    console.log(`   ✗ ${dir}/ directory missing`);
    hasErrors = true;
  }
});

// Check required files
console.log('\n4. Checking required files...');
const requiredFiles = [
  'server.js',
  'package.json',
  'config/db.js',
  'models/User.js',
  'models/Paper.js',
  'controllers/authController.js',
  'controllers/paperController.js',
  'routes/auth.js',
  'routes/papers.js',
  'middleware/auth.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✓ ${file} exists`);
  } else {
    console.log(`   ✗ ${file} missing`);
    hasErrors = true;
  }
});

// Summary
console.log('\n================================');
if (hasErrors) {
  console.log('Status: ✗ Configuration has errors');
  console.log('\nPlease fix the errors above before starting the server.');
  console.log('\nFor help, read QUICKSTART.md');
} else {
  console.log('Status: ✓ Configuration looks good!');
  console.log('\nYou can start the server with: npm run dev');
  console.log('\nFor testing the API, see API_TESTING.md');
}
console.log('================================\n');

process.exit(hasErrors ? 1 : 0);
