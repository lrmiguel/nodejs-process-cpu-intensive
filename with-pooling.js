import express from 'express'
const port = 3002
import Pool from './Pool.js'

const app = express();
let Queue = {}

let Pooler = new Pool(`./fibonacci_runner.js`, 2, (msg) => {
  "use strict";
  console.time('withPoolingQueue');
  let queue = [...Queue[msg.event]];
  Queue[msg.event] = null;  //empty the Queue
  queue.forEach(cb => cb(msg.value));
  console.log(`done with ${msg.event}`)
  console.timeEnd('withPoolingQueue');
});

function asyncBatching(num, cb) {
  if (Queue[num]) {
    Queue[num].push(cb)
  } else {
    Queue[num] = [cb];
    Pooler.assignWork({ num: num, event: num })
  }
}

app.get('/api/fibo/:fibo', (req, res) => {
  asyncBatching(req.params.fibo, (value) => res.end(`${value}`))
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});