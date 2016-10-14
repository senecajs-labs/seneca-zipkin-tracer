'use strict'

const Plugin = require('..')
const Seneca = require('seneca')
const Bench = require('fastbench')

function action (msg, done) {
  done(null, {hello: 'world'})
}

const seneca = Seneca({log: 'silent'})
  .use(Plugin, {
    sampling: 1,
    batchSize: 10000
  })
  .add('performance:test', action)

const clean_seneca = Seneca({log: 'silent'})
  .add('performance:test', action)

console.log('\n\nNo sampling, increased batch size\n\n')

const run = Bench([
  function without_tracer (done) {
    clean_seneca.act('performance:test', done)
  },
  function with_tracer (done) {
    seneca.act('performance:test', done)
  }
], 10000)

run(run)
