import globalSetup from './globalSetup.ts';

async function main() {
  const stop = await globalSetup();
  console.log('global setup ok', typeof stop);
  if (typeof stop === 'function') await stop();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
