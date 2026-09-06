import { Controller, Get, NotImplementedException, Post, Type } from '@nestjs/common';

/**
 * Builds a placeholder controller for a modelled-but-not-yet-implemented resource.
 * GET returns an empty, safe payload so the client can render an empty state;
 * writes fail loudly with 501 so the gap is obvious. Replace the whole module
 * with a real implementation when the feature's phase lands.
 */
export function createStubController(path: string, label: string): Type<unknown> {
  @Controller(path)
  class StubController {
    @Get()
    list() {
      return { items: [], message: `${label} is coming soon`, implemented: false };
    }

    @Post()
    create(): never {
      throw new NotImplementedException(`${label} is not implemented yet`);
    }
  }
  return StubController;
}
