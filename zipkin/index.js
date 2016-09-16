
var Request = require('request')
var zipkinBaseUrl = 'http://127.0.0.1:9411'
var PATH = `${zipkinBaseUrl}/api/v1/spans`

function send (body) {
  Request({
    url: PATH,
    method: 'POST',
    json: true,
    body: [body]
  }, function sent (err, response, body) {
    if (err) {
      return console.log('An error occurred sending trace data', err)
    }

    if (response.statusCode !== 200 && response.statusCode !== 202) {
      return console.log('Server returned an error:', response.statusCode, '\n', body)
    }
  })
}

function generate_timestamp () {
  // use process.hrtime?
  return new Date().getTime() * 1000
}

function generate_id () {
  // copied over from zipkin-js
  var digits = '0123456789abcdef'
  var n = ''
  for (var i = 0; i < 16; i++) {
    var rand = Math.floor(Math.random() * 16)

    // avoid leading zeroes
    if (rand !== 0 || n.length > 0) {
      n += digits[rand]
    }
  }
  return n
}

function create_root_trace () {
  var id = generate_id()

  return {
    trace_id: id,
    span_id: id,
    parent_id: null,
    sampled: true,
    timestamp: generate_timestamp()
  }
}

function get_data (trace_data) {
  if (!trace_data) {
    return create_root_trace()
  }

  return trace_data
}

function get_child (trace_data) {
  if (!trace_data) {
    return create_root_trace()
  }

  return {
    trace_id: trace_data.trace_id,
    parent_span_id: trace_data.span_id,
    span_id: generate_id(),
    sample: true,
    timestamp: generate_timestamp()
  }
}

function send_trace (trace, data) {
  var time = generate_timestamp()
  var body = {
    traceId: trace.trace_id,
    name: data.name,
    id: trace.span_id,
    timestamp: trace.timestamp,
    annotations: [],
    binaryAnnotations: []
  }

  if (trace.parent_span_id) {
    body.parentId = trace.parent_span_id
  }

  for (var i = 0; i < data.annotations.length; i++) {
    body.annotations.push({
      endpoint: {
        serviceName: data.service,
        ipv4: 0,
        port: 0
      },
      timestamp: time,
      value: data.annotations[i]
    })
  }

  send(body)
}

function trace_with_annotation (trace, data, annotation) {
  data.annotations = data.annotations || []
  data.annotations.push(annotation)
  return send_trace(trace, data)
}

function client_send (trace, data) {
  return trace_with_annotation(trace, data, 'cs')
}

function client_recv (trace, data) {
  return trace_with_annotation(trace, data, 'cr')
}

function server_send (trace, data) {
  return trace_with_annotation(trace, data, 'ss')
}

function server_recv (trace, data) {
  return trace_with_annotation(trace, data, 'sr')
}


module.exports = {
  get_data: get_data,
  get_child: get_child,
  client_send: client_send,
  client_recv: client_recv,
  server_send: server_send,
  server_recv: server_recv
}
