# Fastify https-always Plugin
This fastify plugin recognizes http requests and either redirects to an https URL or disallows the request. Useful to ensure connections utilize secure HTTP connection URLs. The logic is very similar to the [express-ssl](https://github.com/jclem/express-ssl) plugin.

This plugin can examine the request headers to determine if a request has been forwarded from a TLS-terminating proxy, a common deployment model. It relies on fastify’s [trustProxy](https://www.fastify.io/docs/latest/Reference/Server/#trustproxy) setting to learn the protocol and host name of a request sent through a proxy, such as an API gateway or load balancer.

### Install

```shell
npm install fastify-https-always
```

### Usage
To use the plugin, simply register it with the fastify instance. Be sure to consider the `trustProxy` setting for fastify. If your app will be deployed behind a proxy such as Heroku or an API gateway, then set trustProxy to true.

```js
const fastify = require('fastify')({
  trustProxy: true
})

fastify.register(require('fastify-https-always'))
```

### Configuration

This plugin has several optional configurations that can be used to change the behavior of the plugin. The following table lists these options for your configuration.

| Option           | Default                                               | Notes                                                                                                                                             |
|------------------|-------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`        | `true`                                                | Enables the plugin. Useful in build systems where the plugin’s enabled state is driven by an environment variable.                                |
| `productionOnly` | `true`                                                | Only enable this plugin in production environments. Checks Node’s `NODE_ENV` environment variable for the standard `production` value.            |
| `redirect`       | `true`                                                | `http` requests will be redirected to the appropriate `https` service. If this config is false, then a `403 Forbidden` error is returned instead. |
| `httpsPort`      | `undefined` (spec uses 443 as the default https port) | Use this value to change the https port used in the redirect Location header.                                                                     |

To utilize the configuration options, pass them in as an object when registering the plugin:

```js
// leave out options whose default is suitable
fastify.register(require('fastify-https-always'), {
    httpsPort: 8443
})
```

### Typescript Support

Fastify-https-always is written in Typescript and includes type declarations for the options.

```typescript
import Fastify from "fastify"
import FastifyHttpsAlwaysPlugin, { HttpsAlwaysOptions } from "fastify-https-always"

const fastify = Fastify({
  trustProxy: true
})

// leave out options whose default is suitable
const httpsAlwaysOpts: HttpsAlwaysOptions = {
  productionOnly: false,
  redirect:       false,
  httpsPort:      8443
}

fastify.register(httpsAlwaysPlugin, httpsAlwaysOpts)
```
