const fs = require('fs');
const Table = require('cli-table2');

setInterval(() => {
  process.stdout.write('\033c');

  // processes
  const processes = JSON.parse(fs.readFileSync('./processes')).map(process => [
    process.processId,
    process.status,
  ]);

  const processTable = new Table({
    head: ['Process ID', 'Status'],
    colWidths: [50, 50],
  });

  processes.forEach(proc => {
    processTable.push(proc);
  });

  console.log(processTable.toString());

  console.log('\n');

  // tokens
  const tokens = JSON.parse(fs.readFileSync('./tokens')).map(token => [
    token.processId,
    token.tokenId,
    token.status,
  ]);

  const tokenTable = new Table({
    head: ['Process ID', 'Token Id', 'Status'],
    colWidths: [50, 50, 50],
  });

  tokens.forEach(tok => {
    tokenTable.push(tok);
  });

  console.log(tokenTable.toString());
}, 101);
