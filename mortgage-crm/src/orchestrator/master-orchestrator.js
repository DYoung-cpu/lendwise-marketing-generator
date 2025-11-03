import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';
import DataAgent from '../agents/data-agent.js';
import MarketIntelligenceAgent from '../agents/market-intelligence-agent.js';
import VisualAgent from '../agents/visual-agent.js';
import PersonalizationAgent from '../agents/personalization-agent.js';
import QualityAgent from '../agents/quality-agent.js';
import DreamboothTrainingAgent from '../agents/dreambooth-training-agent.js';
import ReplicateCatalog from '../models/replicate-catalog.js';
import LearningSystem from '../memory/learning-system.js';
import BrandLearningSystem from '../memory/brand-learning.js';
import PlaywrightLearningSystem from '../memory/playwright-learning.js';
import BrandGenerator from '../brand/brand-generator.js';
import RequestCache from '../services/request-cache.js';

class MasterOrchestrator {
  constructor() {
    console.log('🧠 Initializing Master Orchestrator...');

    // Initialize Replicate
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });

    // Initialize Supabase if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
      );
    }

    // Initialize all components
    this.catalog = new ReplicateCatalog(this.replicate);
    this.dataAgent = new DataAgent();
    this.marketIntel = new MarketIntelligenceAgent();
    this.visualAgent = new VisualAgent(this.replicate, this.catalog);
    this.personalizationAgent = new PersonalizationAgent();
    this.qualityAgent = new QualityAgent(this.supabase);
    this.dreamboothAgent = new DreamboothTrainingAgent(this.supabase);
    this.learningSystem = new LearningSystem(this.supabase);
    this.brandLearning = new BrandLearningSystem(this.supabase);
    this.playwrightLearning = new PlaywrightLearningSystem(this.supabase);
    this.brandGenerator = new BrandGenerator(this.replicate);
    this.requestCache = new RequestCache(this.supabase);

    // Initialize model catalog
    this.initialize();
  }

  async initialize() {
    await this.catalog.discoverModels();
    await this.learningSystem.loadHistory();
    console.log('✅ Orchestrator ready');
  }

  async processRequest(request) {
    console.log('\n═══════════════════════════════════════');
    console.log('🎯 Processing Request');
    console.log('═══════════════════════════════════════');

    // Check cache first (unless explicitly disabled)
    if (!request.preferences?.skipCache) {
      const cached = await this.requestCache.get(request);
      if (cached) {
        console.log('💾 Returning cached result');
        return {
          success: true,
          output: cached.outputUrl,
          model: cached.model,
          cached: true,
          validation: {
            overall: cached.qualityScore || 1
          },
          hitCount: cached.hitCount
        };
      }
    }

    // Step 1: Analyze intent
    const intent = this.analyzeIntent(request);
    console.log('📋 Intent:', intent);

    // Step 2: Create execution plan
    const plan = this.createExecutionPlan(intent);
    console.log('📝 Plan:', plan.steps);

    // Step 3: Execute plan
    const result = await this.executePlan(plan, request);

    // Step 4: Validate quality
    const validation = await this.qualityAgent.validate(result, intent);
    result.validation = validation;

    // Step 5: Learn from outcome
    await this.learningSystem.recordOutcome(intent, result);

    // Step 6: Cache successful results
    if (result.success && result.validation.overall >= 0.7) {
      await this.requestCache.set(request, result);
    }

    // Normalize response format (url → output for consistency)
    if (result.url && !result.output) {
      result.output = result.url;
    }

    return result;
  }

  analyzeIntent(request) {
    // Support both 'prompt' and 'message' field names
    const text = (request.prompt || request.message || '');
    const prompt = text.toLowerCase();

    return {
      type: request.type || this.detectType(prompt),
      needsText: /nmls|rate|percent|contact|phone|email/.test(prompt) || request.loanOfficer,
      needsPhoto: /photo|property|house|person|realtor/.test(prompt),
      needsVideo: /video|tour|animation|walkthrough/.test(prompt),
      needsData: /current|today|latest|market/.test(prompt),
      needsPersonalization: request.loanOfficer || false,
      hasNMLS: /nmls\s*#?\s*\d+/.test(text) || request.loanOfficer?.nmls,
      detectedNMLS: text.match(/nmls\s*#?\s*(\d+)/i)?.[1] || request.loanOfficer?.nmls,
      brand: true // Always apply LendWise branding
    };
  }

  detectType(prompt) {
    if (/rate|update|market/.test(prompt)) return 'rate-update';
    if (/property|listing|house/.test(prompt)) return 'property-listing';
    if (/social|post|instagram/.test(prompt)) return 'social-media';
    if (/video|tour/.test(prompt)) return 'video';
    return 'general';
  }

  createExecutionPlan(intent) {
    const steps = [];

    if (intent.needsData) {
      steps.push('fetch-market-data');
    }

    if (intent.needsPersonalization) {
      steps.push('prepare-personalization');
    }

    steps.push('apply-branding');

    if (intent.needsVideo) {
      steps.push('generate-video');
    } else {
      steps.push('generate-image');
    }

    steps.push('validate-quality');

    return { intent, steps };
  }

  async executePlan(plan, request) {
    const context = { request, plan };

    for (const step of plan.steps) {
      console.log(`\n▶️ Executing: ${step}`);

      switch(step) {
        case 'fetch-market-data':
          // Gather real-time market intelligence
          context.marketData = await this.marketIntel.gatherMarketIntelligence(plan.intent.type);
          console.log('📊 Market Intelligence gathered');

          // Also fetch legacy data for compatibility
          const legacyData = await this.dataAgent.fetchMarketData();
          context.marketData.legacy = legacyData;
          break;

        case 'prepare-personalization':
          context.personalization = await this.personalizationAgent.prepare(request);
          break;

        case 'apply-branding':
          // Support both 'prompt' and 'message' field names
          let textForBranding = request.prompt || request.message || '';

          // Enrich prompt with market intelligence if available
          if (context.marketData && !context.marketData.fallback) {
            textForBranding = this.enrichPromptWithMarketData(textForBranding, context.marketData, plan.intent);
            console.log('💡 Prompt enriched with real-time market data');
          }

          context.brandedPrompt = await this.brandGenerator.applyBranding(
            textForBranding,
            context
          );
          break;

        case 'generate-image':
          context.result = await this.generateWithRetry(
            context.brandedPrompt,
            plan.intent,
            request.preferences?.qualityThreshold || 0.90
          );
          break;

        case 'generate-video':
          context.result = await this.visualAgent.generateVideo(
            context.brandedPrompt,
            plan.intent
          );
          break;

        case 'validate-quality':
          // Validation happens after plan execution
          break;
      }
    }

    return context.result;
  }

  async generateWithRetry(prompt, intent, qualityThreshold = 0.90, maxAttempts = 3) {
    console.log(`\n🔄 Generate with Retry (threshold: ${qualityThreshold * 100}%)`);

    let bestResult = null;
    let bestScore = 0;
    const attemptedModels = new Set();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`\n📍 Attempt ${attempt}/${maxAttempts}`);

      try {
        // Generate image
        const result = await this.visualAgent.generateImage(prompt, intent);

        if (!result.success) {
          console.log(`❌ Generation failed: ${result.error}`);
          continue;
        }

        attemptedModels.add(result.model);

        // Validate quality
        const validation = await this.qualityAgent.validate(result, intent);
        result.validation = validation;

        console.log(`📊 Quality: ${(validation.overall * 100).toFixed(1)}% (threshold: ${qualityThreshold * 100}%)`);

        if (validation.issues.length > 0) {
          console.log(`⚠️  Issues: ${validation.issues.join(', ')}`);
        }

        // Learn from Playwright validation patterns (if hybrid validation was used)
        if (validation.visual?.hybrid && validation.visual.details?.playwright) {
          try {
            await this.playwrightLearning.analyzeAndLearn(
              validation.visual.details.playwright,
              intent,
              validation.overall
            );
          } catch (error) {
            console.warn('Playwright learning error:', error.message);
          }
        }

        // Check if quality threshold met
        if (validation.overall >= qualityThreshold && validation.passed) {
          console.log(`✅ Quality threshold met on attempt ${attempt}!`);
          return result;
        }

        // Keep best attempt
        if (validation.overall > bestScore) {
          bestScore = validation.overall;
          bestResult = result;
          console.log(`💾 New best result: ${(bestScore * 100).toFixed(1)}%`);
        }

        // If not last attempt, try different approach
        if (attempt < maxAttempts) {
          console.log(`🔄 Trying alternative approach (attempt ${attempt + 1})...`);

          // Enhance prompt based on what failed
          if (validation.visual.score < 0.8) {
            prompt += '\n\nIMPORTANT: Add rich visual elements, depth shadows gradients and professional design details with premium aesthetic.';
            console.log('   → Enhancing visual richness');
          }
          if (validation.ocr.score < 0.8) {
            prompt += '\n\nIMPORTANT: All text MUST be crystal clear with maximum contrast, highly readable, professional typography.';
            console.log('   → Enhancing text clarity');
          }
          if (validation.spelling.score < 1.0) {
            prompt += '\n\nIMPORTANT: Check all spelling carefully. Use simple common words.';
            console.log('   → Improving spelling');
          }

          // Cycle through alternative models
          intent.preferAlternativeModel = true;
          intent.alternativeAttempt = (intent.alternativeAttempt || 0) + 1;
          console.log(`   → Switching to alternative model #${intent.alternativeAttempt}`);
        }

      } catch (error) {
        console.error(`❌ Attempt ${attempt} error:`, error.message);
      }
    }

    // Return best result if we have one
    if (bestResult) {
      console.log(`\n⚠️  Using best result: ${(bestScore * 100).toFixed(1)}% (below ${qualityThreshold * 100}% threshold)`);
      return bestResult;
    }

    throw new Error('All generation attempts failed');
  }

  /**
   * Enrich prompt with real-time market intelligence
   */
  enrichPromptWithMarketData(prompt, marketData, intent) {
    let enrichedPrompt = prompt;

    // Content-type specific enrichment
    switch(intent.type) {
      case 'rate-update':
        if (marketData.primary) {
          enrichedPrompt += `\n\nCURRENT MARKET DATA (use this real data):`;
          enrichedPrompt += `\n- 30-Year Fixed Rate: ${marketData.primary['30yr']}`;
          enrichedPrompt += `\n- 15-Year Fixed Rate: ${marketData.primary['15yr']}`;
          enrichedPrompt += `\n- Rate Trend: ${marketData.primary.trend}`;

          if (marketData.headline) {
            enrichedPrompt += `\n- Headline: ${marketData.headline}`;
          }

          if (marketData.suggestions && marketData.suggestions.length > 0) {
            const suggestion = marketData.suggestions[0];
            enrichedPrompt += `\n\nSUGGESTED MESSAGE: ${suggestion.message}`;
            enrichedPrompt += `\nCALL TO ACTION: ${suggestion.cta}`;
          }
        }
        break;

      case 'market-analysis':
        if (marketData.primary) {
          enrichedPrompt += `\n\nMARKET TRENDS DATA:`;
          enrichedPrompt += `\n- Inventory Level: ${marketData.primary.inventoryLevel}`;
          enrichedPrompt += `\n- Median Home Price: ${marketData.primary.medianPrice}`;
          enrichedPrompt += `\n- Days on Market: ${marketData.primary.daysOnMarket}`;
          enrichedPrompt += `\n- Price Direction: ${marketData.primary.priceDirection}`;
          enrichedPrompt += `\n- Market Forecast: ${marketData.primary.forecast}`;

          if (marketData.context) {
            enrichedPrompt += `\n\nFED POLICY CONTEXT:`;
            enrichedPrompt += `\n- Rate Expectation: ${marketData.context.rateExpectation}`;
            enrichedPrompt += `\n- Economic Outlook: ${marketData.context.economicOutlook}`;
          }
        }
        break;

      case 'social-media':
        if (marketData.hook) {
          enrichedPrompt += `\n\nHOOK: ${marketData.hook}`;
        }
        if (marketData.data) {
          enrichedPrompt += `\n- Featured Rate: ${marketData.data}`;
        }
        if (marketData.trend) {
          enrichedPrompt += `\n- Market Trend: ${marketData.trend}`;
        }
        if (marketData.suggestions && marketData.suggestions.length > 0) {
          enrichedPrompt += `\n- CTA: ${marketData.suggestions[0].cta}`;
        }
        break;

      default:
        // General enrichment - add most relevant data points
        if (marketData.rates) {
          enrichedPrompt += `\n\nCURRENT RATES: 30-yr: ${marketData.rates['30yr']}, Trend: ${marketData.rates.trend}`;
        }
        if (marketData.breakingNews && marketData.breakingNews.urgent && marketData.breakingNews.urgent.length > 0) {
          enrichedPrompt += `\n⚠️ BREAKING: ${marketData.breakingNews.urgent[0]}`;
        }
        break;
    }

    return enrichedPrompt;
  }

  async getModelCatalog() {
    return this.catalog.getAllModels();
  }

  async getPerformanceData() {
    return this.learningSystem.getPerformanceStats();
  }
}

export default MasterOrchestrator;
