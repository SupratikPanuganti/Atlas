import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying MCP Server Setup...\n');

// Check if .env file exists and has content
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env file exists');
  console.log('📄 .env content:', envContent.trim());
} else {
  console.log('❌ .env file not found');
}

// Check if package.json has correct configuration
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('✅ package.json exists');
  console.log('📦 Type:', packageJson.type || 'commonjs');
  console.log('🚀 Scripts:', Object.keys(packageJson.scripts || {}));
} else {
  console.log('❌ package.json not found');
}

// Check if index.js exists
const indexPath = path.join(process.cwd(), 'index.js');
if (fs.existsSync(indexPath)) {
  console.log('✅ index.js exists');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  console.log('📄 index.js size:', indexContent.length, 'characters');
} else {
  console.log('❌ index.js not found');
}

console.log('\n🎯 MCP Server Setup Complete!');
console.log('📋 Next steps:');
console.log('1. Restart Cursor to load the MCP server configuration');
console.log('2. Use @supabase commands in Cursor to interact with your database');
console.log('3. Available commands:');
console.log('   - @supabase list_tables');
console.log('   - @supabase run_query SELECT * FROM your_table LIMIT 5;');
console.log('   - @supabase get_table_schema tableName');
console.log('   - @supabase get_table_sample tableName');
console.log('   - @supabase get_betting_stats');

