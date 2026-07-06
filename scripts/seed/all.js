import { execSync } from 'child_process';

function runScript(script) {
  console.log(`\n=== Running ${script} ===`);
  try {
    execSync(`node ${script}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to run ${script}`);
    process.exit(1);
  }
}

console.log('Starting DB Seed...');

runScript('scripts/seed/users.js');
runScript('scripts/seed/restaurant.js');
runScript('scripts/seed/inventory.js');
runScript('scripts/seed/load-test-users.js');

console.log('\n=== DB Seed Completed Successfully ===');
