import cluster from 'cluster';
import http from 'http';
import { cpus } from 'os';
import process from 'process';

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Keep track of http requests
  let numReqs = 0;
  setInterval(() => {
    console.log(`numReqs = ${numReqs}`);
  }, 1000);

  // Count requests
  function messageHandler(msg) {
    if (msg.cmd && msg.cmd === 'notifyRequest') {
      numReqs += 1;
    }
  }

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork().on('disconnect', () => {
      console.log(`worker ${worker.process.pid} disconnected`)
    });
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on('message', messageHandler);
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`hello world from ${process.pid}\n`);

    if (req.method === 'GET' && !req.url.includes('favicon')) {
      // Notify primary about the request
      process.send({ cmd: 'notifyRequest' });
    }
  }).listen(8888);

  console.log(`Worker ${process.pid} started`);
}