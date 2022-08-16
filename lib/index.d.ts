/// <reference types="node" />
import { FastifyPluginOptions } from "fastify";
export interface HttpsAlwaysOptions extends FastifyPluginOptions {
    enabled?: boolean;
    productionOnly?: boolean;
    redirect?: boolean;
    httpsPort?: number;
}
declare const _default: import("fastify").FastifyPluginCallback<HttpsAlwaysOptions, import("http").Server>;
export default _default;
