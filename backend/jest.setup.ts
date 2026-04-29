// jest.setup.js

// temporarily mute console.log from dotenv
const originalLog = console.log;
console.log = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('[dotenv@')) return;
  originalLog(...args);
};

require('dotenv').config({ path: '.env.local' });

console.log = originalLog;
