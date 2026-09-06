import { LlmAdvisor } from './llm-advisor';
import { AdvisorContext, Signal } from './advisor.types';
import { RecommendationDomain, RecommendationSeverity } from '../../common/enums';

const mockCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ messages: { create: mockCreate } })),
}));

function makeConfig(apiKey?: string) {
  return {
    get: jest.fn((key: string) =>
      key === 'anthropic.apiKey' ? apiKey : key === 'anthropic.model' ? 'claude-opus-5' : undefined,
    ),
  } as any;
}

const ctx: AdvisorContext = {
  investments: [],
  assets: [],
  loans: [],
  netWorth: {
    totalInvestments: 1,
    totalAssets: 2,
    totalLiabilities: 0,
    totalAssetsWithInvestments: 3,
    netWorth: 3,
  },
  currency: 'INR',
};
const signals: Signal[] = [
  {
    code: 'x',
    domain: RecommendationDomain.FINANCE,
    severity: RecommendationSeverity.INFO,
    title: 'T',
    message: 'M',
  },
];

function textResponse(text: string) {
  return { content: [{ type: 'text', text }] };
}

describe('LlmAdvisor', () => {
  beforeEach(() => mockCreate.mockReset());

  it('is disabled and returns null without an API key', async () => {
    const advisor = new LlmAdvisor(makeConfig(undefined));
    expect(advisor.enabled).toBe(false);
    await expect(advisor.enhance(signals, ctx)).resolves.toBeNull();
  });

  it('defaults the model when none is configured', () => {
    const config = {
      get: jest.fn((k: string) => (k === 'anthropic.apiKey' ? 'key' : undefined)),
    } as any;
    const advisor = new LlmAdvisor(config);
    expect((advisor as any).model).toBe('claude-opus-5');
  });

  it('parses a valid JSON array of recommendations', async () => {
    const advisor = new LlmAdvisor(makeConfig('key'));
    expect(advisor.enabled).toBe(true);
    mockCreate.mockResolvedValue(
      textResponse(
        '[{"domain":"finance","severity":"warning","title":"A","message":"B","code":"c"}]',
      ),
    );
    const res = await advisor.enhance(signals, ctx);
    expect(res).toEqual([
      {
        domain: 'finance',
        severity: 'warning',
        title: 'A',
        message: 'B',
        code: 'c',
        source: 'llm',
      },
    ]);
  });

  it('coerces unknown domain/severity to safe defaults and drops itemless entries', async () => {
    const advisor = new LlmAdvisor(makeConfig('key'));
    mockCreate.mockResolvedValue(
      textResponse('[{"domain":"zzz","severity":"yyy","title":"A","message":"B"},{"title":""}]'),
    );
    const res = await advisor.enhance(signals, ctx);
    expect(res).toEqual([
      {
        domain: 'general',
        severity: 'info',
        title: 'A',
        message: 'B',
        code: undefined,
        source: 'llm',
      },
    ]);
  });

  it('returns null when the response has no JSON array', async () => {
    const advisor = new LlmAdvisor(makeConfig('key'));
    mockCreate.mockResolvedValue(textResponse('sorry, no data'));
    await expect(advisor.enhance(signals, ctx)).resolves.toBeNull();
  });

  it('returns null on malformed JSON', async () => {
    const advisor = new LlmAdvisor(makeConfig('key'));
    mockCreate.mockResolvedValue(textResponse('[not valid json]'));
    await expect(advisor.enhance(signals, ctx)).resolves.toBeNull();
  });

  it('returns null when every item is filtered out', async () => {
    const advisor = new LlmAdvisor(makeConfig('key'));
    mockCreate.mockResolvedValue(textResponse('[{"title":"only title"}]'));
    await expect(advisor.enhance(signals, ctx)).resolves.toBeNull();
  });

  it('degrades to null and logs when the API call throws', async () => {
    const advisor = new LlmAdvisor(makeConfig('key'));
    jest.spyOn((advisor as any).logger, 'warn').mockImplementation(() => undefined);
    mockCreate.mockRejectedValue(new Error('rate limited'));
    await expect(advisor.enhance(signals, ctx)).resolves.toBeNull();
  });
});
