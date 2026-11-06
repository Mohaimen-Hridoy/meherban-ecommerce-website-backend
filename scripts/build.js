const { execSync } = require('child_process');

console.log('==============================================');
console.log('📦 BazarPool Backend Build & Migration Engine');
console.log('==============================================');

// 1. Generate Prisma Client
console.log('⚙️ Step 1: Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit' });

// 2. If a remote/cloud database is configured, automatically push tables and seed
const dbUrl = process.env.DATABASE_URL || '';
const isRemoteDb = dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1');

if (isRemoteDb) {
  console.log('🌐 Step 2: Remote Cloud Database detected. Synchronizing Prisma schema...');
  try {
    execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema synchronized with cloud PostgreSQL.');
  } catch (err) {
    console.error('⚠️ Warning during prisma db push:', err.message);
  }

  console.log('🌱 Step 3: Seeding Meherban fashion catalog & products...');
  try {
    execSync('npx tsx prisma/seed-meherban.ts', { stdio: 'inherit' });
    console.log('✅ Meherban database seed applied successfully.');
  } catch (err) {
    console.error('⚠️ Warning during seeding:', err.message);
  }
} else {
  console.log('ℹ️ Skipping remote schema push (local/offline environment).');
}

// 4. Compile TypeScript
console.log('🔨 Step 4: Compiling TypeScript to dist/...');
execSync('npx tsc', { stdio: 'inherit' });

console.log('==============================================');
console.log('🎉 Build completed successfully!');
console.log('==============================================');

