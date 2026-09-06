import { Types } from 'mongoose';
import { AdvisorService } from './advisor.service';
import { RecommendationDomain, RecommendationSeverity } from '../../common/enums';

const USER = new Types.ObjectId().toHexString();

const signal = {
  code: 'c',
  domain: RecommendationDomain.FINANCE,
  severity: RecommendationSeverity.INFO,
  title: 'T',
  message: 'M',
};

describe('AdvisorService', () => {
  let recModel: any;
  let rules: any;
  let llm: any;
  let investments: any;
  let assets: any;
  let loans: any;
  let networth: any;
  let service: AdvisorService;

  beforeEach(() => {
    recModel = { insertMany: jest.fn().mockResolvedValue([]), find: jest.fn() };
    rules = { generate: jest.fn().mockReturnValue([signal]) };
    llm = { enabled: false, enhance: jest.fn() };
    investments = { findAllForUser: jest.fn().mockResolvedValue([]) };
    assets = { findAllForUser: jest.fn().mockResolvedValue([]) };
    loans = { findAllForUser: jest.fn().mockResolvedValue([]) };
    networth = { compute: jest.fn().mockResolvedValue({ totalInvestments: 0 }) };
    service = new AdvisorService(recModel, rules, llm, investments, assets, loans, networth);
  });

  it('returns rule-based recommendations when the LLM is disabled', async () => {
    const res = await service.getRecommendations(USER);
    expect(res.source).toBe('rules');
    expect(res.llmEnabled).toBe(false);
    expect(res.recommendations[0]).toMatchObject({ title: 'T', source: 'rules' });
    expect(recModel.insertMany).toHaveBeenCalled();
  });

  it('uses LLM recommendations when available', async () => {
    llm.enabled = true;
    llm.enhance.mockResolvedValue([{ ...signal, source: 'llm' }]);
    const res = await service.getRecommendations(USER);
    expect(res.source).toBe('llm');
    expect(res.recommendations[0].source).toBe('llm');
  });

  it('falls back to rules when the LLM returns nothing', async () => {
    llm.enabled = true;
    llm.enhance.mockResolvedValue(null);
    const res = await service.getRecommendations(USER);
    expect(res.source).toBe('rules');
  });

  it('does not persist when there are no recommendations', async () => {
    rules.generate.mockReturnValue([]);
    const res = await service.getRecommendations(USER);
    expect(res.recommendations).toEqual([]);
    expect(recModel.insertMany).not.toHaveBeenCalled();
  });

  it('history returns persisted recommendations', async () => {
    recModel.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(['r']),
    });
    await expect(service.history(USER)).resolves.toEqual(['r']);
  });
});
