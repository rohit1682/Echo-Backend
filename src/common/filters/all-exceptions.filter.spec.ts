import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function makeHost(url = '/api/x') {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host: any = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url }),
    }),
  };
  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('handles an HttpException with a string response', () => {
    const { host, status, json } = makeHost();
    filter.catch(new HttpException('nope', HttpStatus.FORBIDDEN), host);
    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, message: 'nope' }),
    );
  });

  it('handles an HttpException with an object response (message + error)', () => {
    const { host, json } = makeHost();
    filter.catch(new BadRequestException(['a required', 'b required']), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
        message: ['a required', 'b required'],
        path: '/api/x',
      }),
    );
  });

  it('falls back to exception message/name when the object response omits them', () => {
    const { host, json } = makeHost();
    filter.catch(new HttpException({ foo: 'bar' }, HttpStatus.BAD_GATEWAY), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 502, error: 'HttpException' }),
    );
  });

  it('handles a generic Error as a 500 and logs it', () => {
    const { host, status, json } = makeHost();
    const logSpy = jest.spyOn((filter as any).logger, 'error').mockImplementation(() => undefined);
    filter.catch(new Error('kaboom'), host);
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, error: 'InternalServerError' }),
    );
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('handles a non-Error thrown value', () => {
    const { host, status } = makeHost();
    filter.catch('a plain string', host);
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
