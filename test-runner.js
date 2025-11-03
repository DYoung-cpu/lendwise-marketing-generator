import AutonomousTester from './autonomous-tester.js';

console.log('Starting autonomous tester...');
const tester = new AutonomousTester();
await tester.testAll();
console.log('Completed!');
