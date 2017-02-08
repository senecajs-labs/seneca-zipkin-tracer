'use strict'

const Lab = require('lab')
const Code = require('code')

const Plugin = require('..')
const Seneca = require('seneca')

const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
const expect = Code.expect


function pick_value (obj) {
  return obj.value
}


// docker run -d -p 9411:9411 openzipkin/zipkin
describe('Seneca Zipkin Tracer', function () {
  let client
  let server
  let annotations

  function fakeTransport (data) {
    annotations.push.apply(annotations, data.annotations.map(pick_value))
  }

  function test (done) {
    client.ready(function () {
      client.act('local:test', function (err, res) {
        try {
          expect(err).to.not.exist()
          expect(res).to.equal({hello: 'world'})
          expect(annotations).to.equal([ 'cs', 'cs', 'sr', 'ss', 'cr', 'cr' ])
        }
        catch (ex) {
          return done(ex)
        }

        done()
      })
    })
  }

  lab.beforeEach(function clear_annotations (done) {
    annotations = []
    done()
  })

  lab.beforeEach(function setup_client (done) {
    client = Seneca({
      log: 'silent',
      tag: 'client'
    })
    .use(Plugin, {
      sampling: 1,
      transport: fakeTransport
    })
    .add('local:test', function (args, done) {
      this.act('remote:test', done)
    })
    .ready(done)
  })

  lab.beforeEach(function setup_server (done) {
    server = Seneca({
      log: 'silent',
      tag: 'server'
    })
    .use(Plugin, {
      sampling: 1,
      transport: fakeTransport
    })
    .add('remote:test', function (args, done) {
      done(null, {hello: 'world'})
    })
    .ready(done)
  })

  lab.afterEach(function close_client (done) {
    client.close(done)
  })

  lab.afterEach(function close_server (done) {
    server.close(done)
  })

  it('works with tcp transport', function (done) {
    server.listen({
      type: 'tcp',
      port: 9000,
      pin: 'remote:test'
    })
    client.client({
      type: 'tcp',
      port: 9000,
      pin: 'remote:test'
    })

    test(done)
  })

  // docker run -d -p 5672:5672 rabbitmq
  it('works with amqp transport', function (done) {
    server
      .use('amqp-transport')
      .listen({
        type: 'amqp',
        url: 'amqp://guest:guest@localhost:5672',
        pin: 'remote:test'
      })
    client
      .use('amqp-transport')
      .client({
        type: 'amqp',
        url: 'amqp://guest:guest@localhost:5672',
        pin: 'remote:test'
      })

    test(done)
  })

  // docker run -d -p 6379:6379 redis
  it('works with redis queue transport', function (done) {
    server
      .use('redis-queue-transport')
      .listen({
        type: 'redis-queue',
        pin: 'remote:test'
      })
    client
      .use('redis-queue-transport')
      .client({
        type: 'redis-queue',
        pin: 'remote:test'
      })

    test(done)
  })

  // docker run -d -p 6379:6379 redis
  it('works with redis pubsub transport', function (done) {
    server
      .use('redis-transport')
      .listen({
        type: 'redis',
        pin: 'remote:test'
      })
    client
      .use('redis-transport')
      .client({
        type: 'redis',
        pin: 'remote:test'
      })

    test(done)
  })

  it('works with seneca mesh', {timeout: 10000}, function (done) {
    server.use('mesh', {
      pin: 'remote:test',
      isbase: true
    })
    client.use('mesh')

    test(done)
  })
})
