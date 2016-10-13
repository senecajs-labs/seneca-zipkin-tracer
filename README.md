![Seneca][Logo]

# seneca-zipkin-tracer
[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Dependency Status][david-badge]][david-url]
[![Gitter chat][gitter-badge]][gitter-url]

- __Sponsor:__ [nearForm][Sponsor]
- __Node:__ 4.x, 6.x
- __Seneca:__ 3.3


This plugin sends traces about actions execution to a [zipkin tracing system](http://zipkin.io) instance.

Both local and remote call are traced. Zipkin will receive the action pattern as the method name and the seneca tag as the serviceName.


If you're using this module, and need help, you can:

- Post a [github issue][],
- Tweet to [@senecajs][],
- Ask on the [Gitter][gitter-url].

If you are new to Seneca in general, please take a look at [senecajs.org][]. We have
everything from tutorials to sample apps to help get you up and running quickly.


## Install
```
npm install seneca-zipkin-tracer
```

## Usage

You will need a running instance of zipkin ([best way in dev is with docker](https://github.com/openzipkin/docker-zipkin)).

Apart from that, usage is quite simple: just register the plugin and you're ready to trace.

```js
var server = Seneca({tag: 'service-name'}).use('zipkin-tracer')
```

Location of zipkin can be configured through options:

```js
var server = Seneca({tag: 'service-name'}).use('zipkin-tracer', {
  host: '127.0.0.1',
  port: 9411,
  url: '/api/v1/spans'
})
```

Assuming you have installed zipkin with the docker container linked above, you can reach the zipkin dashboard at http://localhost:9411/ where you should find all the traces collected for your service.

### Options

The plugin accepts the same options of [zipkin-simple](https://github.com/paolochiodi/zipkin-simple#traceroptionsopts):

- *host*: location of zipkin server
- *port*: port of the zipkin http transport
- *url*: path where to send traces
- *transport*: which transport to use (`http`, `http-simple` or custom function)
- *sampling*: the sampling ratio, from 0 to 1 (0 means don't send data, 1 send all data)
- for the http transport, *batchSize* and *batchTimeout* control the batching of spans and traces

## Caveats

Currently only supports zipkin http transport

## Test
To run tests locally,

```
npm run test
```

To obtain a coverage report,

```
npm run coverage; open docs/coverage.html
```

## Contributing
The [Senecajs org][] encourage open participation. If you feel you can help in any way,
be it with documentation, examples, extra testing, or new features please get in touch.


## License
Copyright (c) 2013 - 2016, Richard Rodger and other contributors.
Licensed under [MIT][].

[Sponsor]: http://nearform.com
[Logo]: http://senecajs.org/files/assets/seneca-logo.png
[npm-badge]: https://badge.fury.io/js/seneca-zipkin-tracer.svg
[npm-url]: https://badge.fury.io/js/seneca-zipkin-tracer
[travis-badge]: https://api.travis-ci.org/senecajs-labs/seneca-zipkin-tracer.svg
[travis-url]: https://travis-ci.org/senecajs-labs/seneca-zipkin-tracer
[coveralls-badge]:https://coveralls.io/repos/senecajs-labs/seneca-zipkin-tracer/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/senecajs-labs/seneca-zipkin-tracer?branch=master
[david-badge]: https://david-dm.org/senecajs-labs/seneca-zipkin-tracer.svg
[david-url]: https://david-dm.org/senecajs-labs/seneca-zipkin-tracer
[gitter-badge]: https://badges.gitter.im/senecajs/seneca.png
[gitter-url]: https://gitter.im/senecajs/seneca
[MIT]: ./LICENSE
[Senecajs org]: https://github.com/senecajs/
[Seneca.js]: https://www.npmjs.com/package/seneca
[senecajs.org]: http://senecajs.org/
[github issue]: https://github.com/senecajs-labs/seneca-zipkin-tracer/issues
[@senecajs]: http://twitter.com/senecajs