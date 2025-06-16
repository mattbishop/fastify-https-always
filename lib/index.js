"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastifyHttpsAlwaysPlugin = void 0;
const error_1 = __importDefault(require("@fastify/error"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const HTTPS_REQUIRED = (0, error_1.default)("FST_HTTPS_REQUIRED", "Please use HTTPS when communicating with this server.", 403);
function handleRequest(ctx, request, reply, next) {
    const { port, redirect } = ctx;
    const { hostname, protocol, url } = request;
    if (protocol !== "https") {
        if (redirect) {
            const portIdx = hostname.lastIndexOf(":");
            const host = portIdx > 0 ? hostname.substring(0, portIdx) : hostname;
            const httpsUrl = `https://${host}${port}${url}`;
            reply.redirect(httpsUrl, 301);
        }
        else {
            next(HTTPS_REQUIRED());
            return;
        }
    }
    next();
}
function plugin(fastify, opts, next) {
    const { enabled = true, productionOnly = true, redirect = true, httpsPort } = opts;
    if (enabled) {
        const inProd = process.env.NODE_ENV === "production";
        if (!productionOnly || inProd) {
            const ctx = {
                redirect,
                port: httpsPort ? `:${httpsPort}` : ""
            };
            fastify.addHook("onRequest", (q, p, d) => handleRequest(ctx, q, p, d));
        }
    }
    next();
}
exports.FastifyHttpsAlwaysPlugin = (0, fastify_plugin_1.default)(plugin, {
    name: "fastify-https-always",
    fastify: ">=5.x"
});
exports.default = exports.FastifyHttpsAlwaysPlugin;
