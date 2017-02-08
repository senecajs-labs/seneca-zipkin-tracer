
var Zipkin = require('zipkin-simple')
var Tracer = new Zipkin({
  host: '127.0.0.1',
  port: 9411
})

function internal_action (msg) {
  return msg.role === 'seneca' ||
    msg.role === 'transport' ||
    msg.role === 'options' ||
    msg.role === 'mesh' ||
    msg.init
}


function client_inward (ctx, msg) {
  var service = ctx.seneca.options().tag
  var pin = msg.meta$.pattern

  var trace_data = Tracer.get_child(ctx.seneca.fixedargs.__tracer__)

  trace_data = Tracer.send_client_send(trace_data, {
    service: service,
    name: pin
  })

  ctx.__tracer__ = msg.__tracer__ = ctx.seneca.fixedargs.__tracer__ = trace_data
}


function server_inward (ctx, msg) {
  var service = ctx.seneca.options().tag
  var pin = msg.meta$.pattern

  var trace_data = Tracer.send_server_recv(msg.__tracer__, {
    service: service,
    name: pin
  })

  ctx.__tracer__ = msg.__tracer__ = ctx.seneca.fixedargs.__tracer__ = trace_data
}

function client_outward (ctx, msg) {
  var service = ctx.seneca.options().tag
  var pin = msg.meta$.pattern
  var trace_data = ctx.__tracer__

  Tracer.send_client_recv(trace_data, {
    service: service,
    name: pin
  })
}

function server_outward (ctx, msg) {
  var service = ctx.seneca.options().tag
  var pin = msg.meta$.pattern
  var trace_data = ctx.__tracer__

  Tracer.send_server_send(trace_data, {
    service: service,
    name: pin
  })
}

function zipkin_inward (ctx, data) {
  if (internal_action(data.msg)) {
    return
  }

  var msg = data.msg
  ctx.server = msg.transport$ && msg.meta$.plugin_name !== 'client$'
  if (ctx.server) {
    return server_inward(ctx, msg)
  }

  client_inward(ctx, msg)
}

function zipkin_outward (ctx, data) {
  if (internal_action(data.msg)) {
    return
  }

  if (!ctx.__tracer__) {
    return
  }

  var msg = data.msg
  if (ctx.server) {
    return server_outward(ctx, msg)
  }

  client_outward(ctx, msg)
}

function tracer_plugin (options) {
  Tracer.options(options)
  var seneca = this

  seneca.inward(zipkin_inward)
  seneca.outward(zipkin_outward)
}

module.exports = tracer_plugin
