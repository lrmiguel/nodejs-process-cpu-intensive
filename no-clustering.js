import express from 'express';
const port = 3000;

const app = express();
console.log(`Worker Number ${process.pid} started`);

app.get('/', (req, res) => {
  res.send('Hi There! This application does not use clustering.....');
})

app.get('/api/nocluster', function (req, res) {
  console.time('noclusterApi');
  const base = 8;
  let result = 0;
  for (let i = Math.pow(base, 7); i >= 0; i--) {
    result += i + Math.pow(i, 40);
  };
  console.timeEnd('noclusterApi');

  console.log(`RESULT IS ${result} - ON PROCESS ${process.pid}`);
  res.send(`Result number is ${result}`);
});

app.get('/api/fibo/:fibo', function (req, res) {
  console.time('noclusterFibonacciApi');
  let num = parseInt(req.params.fibo);
  console.log(num)
  res.end(`${fibo(num)}`)
  console.timeEnd('noclusterFibonacciApi');
});

function fibo(n) {

  if (n < 2)
    return 1;
  else return fibo(n - 2) + fibo(n - 1);
}

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});