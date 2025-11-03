import MasterOrchestrator from '../src/orchestrator/master-orchestrator.js';

describe('MasterOrchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new MasterOrchestrator();
  });

  test('should analyze intent correctly for rate update', () => {
    const request = { prompt: 'Create daily rate update with NMLS 123456' };
    const intent = orchestrator.analyzeIntent(request);

    expect(intent.type).toBe('rate-update');
    expect(intent.needsText).toBe(true);
    expect(intent.hasNMLS).toBe(true);
    expect(intent.detectedNMLS).toBe('123456');
  });

  test('should detect video requests', () => {
    const request = { prompt: 'Create property tour video' };
    const intent = orchestrator.analyzeIntent(request);

    expect(intent.needsVideo).toBe(true);
  });

  test('should create execution plan', () => {
    const intent = {
      needsData: true,
      needsPersonalization: true,
      needsVideo: false
    };

    const plan = orchestrator.createExecutionPlan(intent);

    expect(plan.steps).toContain('fetch-market-data');
    expect(plan.steps).toContain('prepare-personalization');
    expect(plan.steps).toContain('generate-image');
  });
});
