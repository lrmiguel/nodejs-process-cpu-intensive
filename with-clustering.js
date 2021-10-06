import express from 'express'
const port = 3001
import cluster from 'cluster'
import os from 'os'

const totalCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });

} else {
  start();
}

function start() {
  const app = express();
  console.log(`Worker ${process.pid} started`);

  app.get('/', (req, res) => {
    res.send('Hi There! This application use clustering.....');
  });

  app.get('/api/withcluster', function (req, res) {
    console.time('withclusterApi');
    const base = 8;
    let result = 0;
    for (let i = Math.pow(base, 7); i >= 0; i--) {
      result += i + Math.pow(i, 10);
    };
    console.timeEnd('withclusterApi');

    console.log(`Result IS ${result} - ON PROCESS ${process.pid}`);
    res.send(`Result number is ${result}`);
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}