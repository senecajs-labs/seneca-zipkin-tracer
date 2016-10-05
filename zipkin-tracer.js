
var Tracer = require('zipkin-simple')
Tracer.options({
  host: '127.0.0.1',
  port: 9411
})

function handler (msg, done) {
  var pin = msg.meta$.pattern
  if (msg.transport$) {
    return handle_as_server(this, pin, msg, done)
  }

  handle_as_client(this, pin, msg, done)
}

function wrap_add (seneca) {
  var root = seneca.root
  var api_add = root.add
  root.add = function () {
    api_add.apply(this, arguments)

    var args = seneca.util.parsepattern(this, arguments, 'action:f? actmeta:o?')
    var pattern = args.pattern

    if (!internal_action(pattern)) {
      pattern.strict$ = pattern.strict$ || {}
      pattern.strict$.add = true
      api_add.call(seneca, pattern, handler)
    }
  }
}

function internal_action (pattern) {
  // TODO support jsonic version here (i.e. "role:seneca")
  return pattern.role === 'seneca' ||
    pattern.role === 'transport' ||
    pattern.role === 'options' ||
    pattern.role === 'mesh' ||
    pattern.init
}

function override_actions (seneca) {
  var actions = seneca.private$.actrouter.list()
  for (var i = 0; i < actions.length; i++) {
    var action = actions[i]

    if (!internal_action(action.match)) {
      seneca.add(action.match, handler)
    }
  }
}

function handle_as_client (context, pin, msg, done) {
  var service = context.private$.optioner.get().tag
  var trace_data = Tracer.get_child(context.fixedargs.__tracer__)
  Tracer.client_send(trace_data, {
    service: service,
    name: pin
  })

  context.fixedargs.__tracer__ = trace_data

  context.prior(msg, function (err, msg) {
    Tracer.client_recv(trace_data, {
      service: service,
      name: pin
    })

    done(err, msg)
  })
}

function handle_as_server (context, pin, msg, done) {
  var service = context.private$.optioner.get().tag
  var trace_data = Tracer.get_data(msg.__tracer__)
  Tracer.server_recv(trace_data, {
    service: service,
    name: pin
  })

  msg.tracer = context.fixedargs.__tracer__ = trace_data

  context.prior(msg, function (err, msg) {
    Tracer.server_send(trace_data, {
      service: service,
      name: pin
    })

    done(err, msg)
  })
}

function tracer_plugin (options) {
  Tracer.options(options.zipkin)
  var seneca = this
  override_actions(seneca)
  wrap_add(seneca)
}

module.exports = tracer_plugin
