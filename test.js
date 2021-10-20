const { join } = require("path");

function log(text) {
  if(text.endsWith('.temp.ts') || text.endsWith('.temp.js')) return;
  console.log(text.split('\\').reverse());
}

const text = join(__dirname, 'index.js');

log(text)