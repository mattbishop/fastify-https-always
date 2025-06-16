import createError from "@fastify/error"
import {FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest, HookHandlerDoneFunction} from "fastify"
import fp from "fastify-plugin"


export interface HttpsAlwaysOptions extends FastifyPluginOptions {
  enabled?:         boolean
  productionOnly?:  boolean
  redirect?:        boolean
  httpsPort?:       number
}


type HttpsAlwaysContext = {
  port:     string
  redirect: boolean
}


const HTTPS_REQUIRED = createError(
  "FST_HTTPS_REQUIRED",
  "Please use HTTPS when communicating with this server.",
  403)

function handleRequest(ctx:     HttpsAlwaysContext,
                       request: FastifyRequest,
                       reply:   FastifyReply,
                       next:    HookHandlerDoneFunction) {
  const {
    port,
    redirect
  } = ctx

  const {
    hostname,
    protocol,
    url
  } = request


  if (protocol !== "https") {
    if (redirect) {
      const portIdx = hostname.lastIndexOf(":")
      const host = portIdx > 0 ? hostname.substring(0, portIdx) : hostname
      const httpsUrl = `https://${host}${port}${url}`
      reply.redirect(httpsUrl, 301)
    } else {
      next(HTTPS_REQUIRED())
      return
    }
  }

  next()
}


function plugin(fastify:  FastifyInstance,
                opts:     HttpsAlwaysOptions,
                next:     () => void) {
  const {
    enabled        = true,
    productionOnly = true,
    redirect       = true,
    httpsPort
  } = opts

  if (enabled) {
    const inProd = process.env.NODE_ENV === "production"
    if (!productionOnly || inProd) {
      const ctx: HttpsAlwaysContext = {
        redirect,
        port: httpsPort ? `:${httpsPort}` : ""
      }
      fastify.addHook("onRequest", (q, p, d) => handleRequest(ctx, q, p, d))
    }
  }

  next()
}


export const FastifyHttpsAlwaysPlugin = fp(plugin, {
  name:     "fastify-https-always",
  fastify:  ">=5.x"
})

export default FastifyHttpsAlwaysPlugin
