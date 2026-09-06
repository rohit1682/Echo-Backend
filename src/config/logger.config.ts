import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Structured HTTP logging via pino. Automatically logs every request and
 * response (method, url, status, response time) plus the authenticated userId,
 * so failures can be traced per endpoint. Pretty-printed in dev, JSON in prod.
 */
export function buildPinoParams(env: string, level: string): Params {
  const isProd = env === 'production';
  return {
    pinoHttp: {
      level,
      // A request id ties all logs for one request together.
      genReqId: (req: IncomingMessage) => (req.headers['x-request-id'] as string) || randomUUID(),
      autoLogging: true,
      // Escalate log level by response status so failures stand out.
      customLogLevel: (_req, res: ServerResponse, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customProps: (req: any) => ({
        userId: req.user?.userId,
        context: 'HTTP',
      }),
      // Never log secrets.
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.refreshToken',
          'req.body.idToken',
          'res.headers["set-cookie"]',
        ],
        remove: true,
      },
      serializers: {
        req: (req: any) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res: any) => ({ statusCode: res.statusCode }),
      },
      transport: isProd
        ? undefined
        : {
            target: 'pino-pretty',
            options: { singleLine: true, colorize: true, translateTime: 'SYS:HH:MM:ss' },
          },
    },
  };
}
