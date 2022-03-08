const fsp = require('fs/promises');

const { Worker } = require('worker_threads');

//Create new worker
const worker = new Worker('./worker.js');

(async () => {
  const timestamp = Date.now();
  const filename = `urls-${timestamp}.txt`;
  await fsp.writeFile(filename, '');

  for (let multiplier = 0; multiplier < 100; multiplier++) {
    worker.postMessage({ filename, multiplier });
  }
})();
