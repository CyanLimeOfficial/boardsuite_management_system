// src/migrations/migrations.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// This gets the directory where the script is located (i.e., 'src/migrations/')
const migrationsDirectory = path.dirname(__filename);

console.log('--- Starting Database Migrations ---');

try {
    // Read all filenames from the migrations directory
    const files = fs.readdirSync(migrationsDirectory);

    // Find all files that end with .js but are NOT this runner script
    const migrationFiles = files.filter(
        (file) => file.endsWith('.js') && file !== 'migrations.js'
    );

    if (migrationFiles.length === 0) {
        console.log('No migration files found to run.');
    } else {
        // Loop through each migration file and execute it with Node.js
        for (const file of migrationFiles) {
            const filePath = path.join(migrationsDirectory, file);
            console.log(`\nExecuting: ${file}...`);
            // This command runs 'node path/to/your/file.js' and shows its output
            execSync(`node "${filePath}"`, { stdio: 'inherit' });
        }
    }

    console.log('\n--- All migrations completed successfully! ---');

} catch (error) {
    console.error('\n❌ An error occurred during the migration process:', error.message);
    process.exit(1); // Exit with an error code
}