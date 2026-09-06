import { buildPinoParams } from './logger.config';

describe('buildPinoParams', () => {
  it('uses pino-pretty transport in development', () => {
    const params = buildPinoParams('development', 'debug') as any;
    expect(params.pinoHttp.level).toBe('debug');
    expect(params.pinoHttp.transport.target).toBe('pino-pretty');
  });

  it('omits the transport in production', () => {
    const params = buildPinoParams('production', 'info') as any;
    expect(params.pinoHttp.transport).toBeUndefined();
  });

  it('derives a request id from the header or generates one', () => {
    const params = buildPinoParams('development', 'debug') as any;
    expect(params.pinoHttp.genReqId({ headers: { 'x-request-id': 'abc' } })).toBe('abc');
    const generated = params.pinoHttp.genReqId({ headers: {} });
    expect(typeof generated).toBe('string');
    expect(generated.length).toBeGreaterThan(0);
  });

  it('escalates log level by response status', () => {
    const { customLogLevel } = (buildPinoParams('development', 'debug') as any).pinoHttp;
    expect(customLogLevel({}, { statusCode: 200 }, undefined)).toBe('info');
    expect(customLogLevel({}, { statusCode: 404 }, undefined)).toBe('warn');
    expect(customLogLevel({}, { statusCode: 500 }, undefined)).toBe('error');
    expect(customLogLevel({}, { statusCode: 200 }, new Error('x'))).toBe('error');
  });

  it('adds userId + context custom props', () => {
    const { customProps } = (buildPinoParams('development', 'debug') as any).pinoHttp;
    expect(customProps({ user: { userId: 'u1' } })).toEqual({ userId: 'u1', context: 'HTTP' });
    expect(customProps({})).toEqual({ userId: undefined, context: 'HTTP' });
  });

  it('serializes only safe request/response fields', () => {
    const { serializers } = (buildPinoParams('development', 'debug') as any).pinoHttp;
    expect(
      serializers.req({ id: '1', method: 'GET', url: '/x', headers: { authorization: 'secret' } }),
    ).toEqual({
      id: '1',
      method: 'GET',
      url: '/x',
    });
    expect(serializers.res({ statusCode: 200, headers: {} })).toEqual({ statusCode: 200 });
  });
});
