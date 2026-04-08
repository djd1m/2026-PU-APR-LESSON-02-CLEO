import { startAnalysisWorker } from './queue/index';

console.log('Starting cleo-rf worker...');
startAnalysisWorker();
console.log('Worker is running. Waiting for jobs...');
