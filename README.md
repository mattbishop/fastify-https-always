# fastify-https-always
This fastify plugin recognizes http requests and either redirects to https or disallows the request. Useful to ensure connections utilize secure HTTP connection URLs. The logic is very similar to the [express-ssl](https://github.com/jclem/express-ssl) plugin. It can examine the request headers to determine if a request has been forwarded from a TLS-terminating proxy, a common deployment model.

### Configuration

### fastify's trustProxy
