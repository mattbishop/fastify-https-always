# fastify-https-always
This fastify plugin recognizes http requests and either redirects to an https URL or disallows the request. Useful to ensure connections utilize secure HTTP connection URLs. The logic is very similar to the [express-ssl](https://github.com/jclem/express-ssl) plugin.

This plugin can examine the request headers to determine if a request has been forwarded from a TLS-terminating proxy, a common deployment model. It relies on fastify’s [trustProxy](https://www.fastify.io/docs/latest/Reference/Server/#trustproxy) setting to learn the protocol and host name of a request sent through a proxy, such as an API gateway or load balancer.

### Configuration

This plugin has several optional configurations that can be used to change the behavior of the plugin. The following table lists these options for your configuration.

| Option           | Default                                               | Notes                                                        |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| `enabled`        | `true`                                                | Enables the plugin. Useful in build systems where the plugin’s enabled state is driven by an environment variable. |
| `productionOnly` | `true`                                                | Only enable this plugin in production environments. Checks Node’s `NODE_ENV` environment variable for the standard `production` value. |
| `redirect`       | `true`                                                | `http` requests will be redirected to the appropriate `https` service. If this config is false, then a `403 Forbidden` error is returned instead. |
| `httpsPort`      | `undefined` (spec uses 443 as the default https port) | Use this value to change the https port used in the redirect Location header. |

