class ReplicateCatalog {
  constructor(replicate) {
    this.replicate = replicate;
    this.models = new Map();
    this.detailedModels = new Map(); // Cache for detailed model info
  }

  async discoverModels() {
    console.log('🔍 Discovering ALL Replicate models via API...');

    try {
      // Fetch all collections
      const collectionsData = await this.replicate.collections.list();
      const collections = collectionsData.results || [];

      console.log(`📦 Found ${collections.length} collections`);

      // Key collections to fetch models from
      const keyCollections = [
        'text-to-image',
        'image-to-video',
        'image-to-image',
        'super-resolution',
        'video-to-text',
        'official',
        'try-for-free'
      ];

      // Fetch models from each collection
      for (const collectionSlug of keyCollections) {
        try {
          const collection = await this.replicate.collections.get(collectionSlug);
          const models = collection.models || [];

          console.log(`  📊 ${collectionSlug}: ${models.length} models`);

          for (const model of models) {
            const modelId = `${model.owner}/${model.name}`;

            if (!this.models.has(modelId)) {
              const modelInfo = this.parseModelInfo(model, collectionSlug);
              this.models.set(modelId, modelInfo);
            }
          }
        } catch (error) {
          console.warn(`  ⚠️  Could not fetch ${collectionSlug}:`, error.message);
        }
      }

      console.log(`✅ Discovered ${this.models.size} unique models from Replicate API`);

      // Fetch detailed info for top models
      await this.enrichTopModels();

    } catch (error) {
      console.warn('⚠️  API discovery failed, using curated list:', error.message);
      this.loadCuratedModels();
    }
  }

  async enrichTopModels() {
    // Get detailed metadata for top models in each category
    const topModels = [
      'google/gemini-2.5-flash-image',  // Multimodal with image input support
      'google/imagen-4-fast',
      'google/imagen-4-ultra',
      'ideogram-ai/ideogram-v3-quality',
      'ideogram-ai/ideogram-v2a-turbo',
      'luma/photon',
      'luma/photon-flash',
      'black-forest-labs/flux-1.1-pro',
      'google/veo-3-fast',
      'stability-ai/stable-video-diffusion'
    ];

    console.log('🔎 Enriching top models with detailed metadata...');

    for (const modelId of topModels) {
      if (this.models.has(modelId)) {
        try {
          const [owner, name] = modelId.split('/');
          const detailed = await this.replicate.models.get(owner, name);

          // Merge detailed info
          const existing = this.models.get(modelId);
          existing.detailedDescription = detailed.description;
          existing.runCount = detailed.run_count;
          existing.githubUrl = detailed.github_url;
          existing.paperUrl = detailed.paper_url;
          existing.inputSchema = this.extractInputSchema(detailed);
          existing.enriched = true;

          this.detailedModels.set(modelId, detailed);
        } catch (error) {
          // Model might not be accessible, skip
        }
      }
    }

    const enrichedCount = Array.from(this.models.values()).filter(m => m.enriched).length;
    console.log(`  ✨ Enriched ${enrichedCount} models with detailed metadata`);
  }

  extractInputSchema(modelDetails) {
    try {
      const schema = modelDetails.latest_version?.openapi_schema?.components?.schemas?.Input;
      if (!schema) return null;

      return {
        properties: Object.keys(schema.properties || {}),
        required: schema.required || [],
        supportsAspectRatio: 'aspect_ratio' in (schema.properties || {}),
        supportsNegativePrompt: 'negative_prompt' in (schema.properties || {}),
        supportsSteps: 'num_inference_steps' in (schema.properties || {}),
        supportsGuidance: 'guidance_scale' in (schema.properties || {})
      };
    } catch (error) {
      return null;
    }
  }

  parseModelInfo(model, collectionSlug) {
    const modelId = `${model.owner}/${model.name}`;
    const name = model.name;

    // Categorize based on collection and model properties
    const category = this.categorizeModel(modelId, name, collectionSlug);
    const capabilities = this.inferCapabilities(modelId, name, collectionSlug, model);

    return {
      id: modelId,
      name: this.formatModelName(name),
      category,
      capabilities,
      owner: model.owner,
      description: model.description || '',
      runs: model.run_count || 0,
      coverImage: model.cover_image_url,
      latestVersion: model.latest_version?.id,
      enriched: false
    };
  }

  categorizeModel(modelId, name, collectionSlug) {
    const id = modelId.toLowerCase();
    const n = name.toLowerCase();
    const col = collectionSlug.toLowerCase();

    // Collection-based categorization
    if (col.includes('video')) {
      if (col.includes('image-to-video')) return 'image-to-video';
      return 'video';
    }

    // Video models
    if (id.includes('video') || n.includes('animate') || id.includes('zeroscope') ||
        id.includes('veo') || id.includes('wan-video')) {
      return 'video';
    }

    // Text-optimized models (CRITICAL for mortgage marketing with NMLS)
    if (id.includes('imagen') || id.includes('ideogram') || id.includes('playground') ||
        id.includes('minimax') || id.includes('hailuo')) {
      return 'text';
    }

    // Fast models
    if (n.includes('lightning') || n.includes('lcm') || n.includes('turbo') ||
        n.includes('schnell') || n.includes('flash') || n.includes('fast') || n.includes('sprint')) {
      return 'fast';
    }

    // Photo models
    if (id.includes('flux') || id.includes('realvis') || id.includes('photomaker') ||
        id.includes('photon') || id.includes('luma')) {
      return 'photo';
    }

    // Utility models
    if (id.includes('rembg') || id.includes('esrgan') || id.includes('upscal') ||
        id.includes('gfpgan') || id.includes('codeformer') || id.includes('enhance') ||
        col.includes('super-resolution') || id.includes('clarity')) {
      return 'utility';
    }

    // Artistic/style models
    if (id.includes('midjourney') || id.includes('openjourney') || id.includes('anything') ||
        id.includes('emoji') || id.includes('sticker') || id.includes('dreamshaper')) {
      return 'artistic';
    }

    return 'general';
  }

  inferCapabilities(modelId, name, collectionSlug, modelData) {
    const capabilities = [];
    const id = modelId.toLowerCase();
    const n = name.toLowerCase();
    const col = collectionSlug.toLowerCase();
    const desc = (modelData?.description || '').toLowerCase();

    // Text rendering (CRITICAL for mortgage marketing)
    if (id.includes('imagen') || id.includes('ideogram') || id.includes('minimax') || id.includes('hailuo')) {
      capabilities.push('text-rendering', 'typography');

      // Mark as NMLS-friendly if it's a text specialist
      if (id.includes('imagen') || id.includes('ideogram')) {
        capabilities.push('nmls-friendly', 'rate-update-optimized');
      }
    }

    // Photorealistic
    if (id.includes('flux') || id.includes('sdxl') || id.includes('photon') || id.includes('luma')) {
      capabilities.push('photorealistic', 'high-quality');
    }

    // Speed
    if (n.includes('lightning') || n.includes('turbo') || n.includes('fast') ||
        n.includes('flash') || n.includes('sprint') || desc.includes('fast')) {
      capabilities.push('speed', 'fast-generation');
    }

    // Video
    if (id.includes('video') || n.includes('animate') || col.includes('video') || id.includes('veo')) {
      capabilities.push('video-generation', 'animation');
    }

    // Utilities
    if (id.includes('rembg')) capabilities.push('background-removal');
    if (id.includes('esrgan') || id.includes('upscal') || id.includes('clarity')) {
      capabilities.push('upscaling', 'enhancement');
    }
    if (id.includes('inpaint')) capabilities.push('inpainting', 'editing');
    if (id.includes('controlnet') || id.includes('kontext')) {
      capabilities.push('controlled-generation', 'pose-control');
    }

    // Image-to-video
    if (col.includes('image-to-video')) {
      capabilities.push('image-to-video', 'motion-generation');
    }

    // Popularity indicator
    if (modelData?.run_count > 100000) {
      capabilities.push('popular', 'battle-tested');
    }

    return capabilities.length > 0 ? capabilities : ['general-purpose'];
  }

  formatModelName(name) {
    // Handle common naming patterns
    name = name.replace(/-/g, ' ');
    name = name.replace(/_/g, ' ');

    // Capitalize first letter of each word
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  loadCuratedModels() {
    // Fallback curated list - latest models as of 2025
    const curated = [
      { id: 'google/imagen-4-ultra', name: 'Imagen 4 Ultra', category: 'text', capabilities: ['text-rendering', 'nmls-friendly'] },
      { id: 'google/imagen-4-fast', name: 'Imagen 4 Fast', category: 'text', capabilities: ['text-rendering', 'speed'] },
      { id: 'ideogram-ai/ideogram-v3-quality', name: 'Ideogram v3 Quality', category: 'text', capabilities: ['typography', 'nmls-friendly'] },
      { id: 'ideogram-ai/ideogram-v2a-turbo', name: 'Ideogram v2a Turbo', category: 'text', capabilities: ['typography', 'speed'] },
      { id: 'luma/photon', name: 'Luma Photon', category: 'photo', capabilities: ['photorealistic'] },
      { id: 'luma/photon-flash', name: 'Luma Photon Flash', category: 'fast', capabilities: ['photorealistic', 'speed'] },
      { id: 'black-forest-labs/flux-1.1-pro', name: 'FLUX 1.1 Pro', category: 'photo', capabilities: ['photorealistic'] },
      { id: 'stability-ai/sdxl', name: 'SDXL', category: 'general', capabilities: ['versatile'] },
      { id: 'google/veo-3-fast', name: 'Veo 3 Fast', category: 'video', capabilities: ['video-generation', 'speed'] },
      { id: 'stability-ai/stable-video-diffusion', name: 'Stable Video', category: 'video', capabilities: ['video-generation'] },
      { id: 'cjwbw/rembg', name: 'RemBG', category: 'utility', capabilities: ['background-removal'] },
      { id: 'nightmareai/real-esrgan', name: 'Real-ESRGAN', category: 'utility', capabilities: ['upscaling'] }
    ];

    for (const model of curated) {
      this.models.set(model.id, model);
    }

    console.log(`✅ Loaded ${this.models.size} curated models`);
  }

  getAllModels() {
    return Array.from(this.models.values());
  }

  getModelsByCategory(category) {
    return this.getAllModels().filter(m => m.category === category);
  }

  getModelsByCapability(capability) {
    return this.getAllModels().filter(m =>
      m.capabilities.includes(capability)
    );
  }

  getVideoModels() {
    return this.getModelsByCategory('video');
  }

  getTextModels() {
    return this.getModelsByCategory('text');
  }

  getPhotoModels() {
    return this.getModelsByCategory('photo');
  }

  getFastModels() {
    return this.getModelsByCategory('fast');
  }

  getNMLSFriendlyModels() {
    const models = this.getModelsByCapability('nmls-friendly');
    // Prioritize QUALITY over TURBO/FAST (turbo has terrible text rendering)
    return models.sort((a, b) => {
      // Imagen 4 Ultra/Fast > everything else (best text rendering)
      if (a.id.includes('imagen-4') && !b.id.includes('imagen-4')) return -1;
      if (b.id.includes('imagen-4') && !a.id.includes('imagen-4')) return 1;

      // Ideogram v3 Quality > v3 Turbo (turbo garbles text!)
      if (a.id.includes('v3-quality') && b.id.includes('turbo')) return -1;
      if (b.id.includes('v3-quality') && a.id.includes('turbo')) return 1;

      // v3 > v2
      if (a.id.includes('ideogram-v3') && !b.id.includes('ideogram-v3')) return -1;
      if (b.id.includes('ideogram-v3') && !a.id.includes('ideogram-v3')) return 1;

      // Sort by run count
      return (b.runs || 0) - (a.runs || 0);
    });
  }

  getVideoModel() {
    // Prefer latest Google Veo or Luma
    const videos = this.getVideoModels();
    return videos.find(m => m.id.includes('veo-3')) ||
           videos.find(m => m.id.includes('photon')) ||
           videos[0];
  }

  getTextModel() {
    // Prefer latest Imagen 4 or Ideogram v3
    const textModels = this.getTextModels();
    return textModels.find(m => m.id.includes('imagen-4-fast')) ||
           textModels.find(m => m.id.includes('ideogram-v3')) ||
           textModels.find(m => m.id.includes('ideogram-v2a')) ||
           textModels[0];
  }

  searchModels(query) {
    const q = query.toLowerCase();
    return this.getAllModels().filter(m =>
      m.id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.capabilities.some(c => c.includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q))
    );
  }

  getModelStats() {
    const stats = {
      total: this.models.size,
      enriched: Array.from(this.models.values()).filter(m => m.enriched).length,
      byCategory: {},
      topCapabilities: {},
      topModels: []
    };

    for (const model of this.getAllModels()) {
      // Count by category
      stats.byCategory[model.category] = (stats.byCategory[model.category] || 0) + 1;

      // Count capabilities
      for (const cap of model.capabilities) {
        stats.topCapabilities[cap] = (stats.topCapabilities[cap] || 0) + 1;
      }
    }

    // Get top models by run count
    stats.topModels = this.getAllModels()
      .filter(m => m.runs > 0)
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 10)
      .map(m => ({ id: m.id, name: m.name, runs: m.runs, category: m.category }));

    return stats;
  }

  getRecommendation(intent) {
    // Intelligent model recommendation based on intent
    const recommendations = {
      reason: '',
      primary: null,
      alternatives: []
    };

    if (intent.needsText || intent.hasNMLS) {
      // NMLS or text rendering needed
      const textModels = this.getNMLSFriendlyModels();
      recommendations.primary = textModels[0];
      recommendations.alternatives = textModels.slice(1, 3);
      recommendations.reason = 'Text rendering optimized for NMLS numbers and rates';
    } else if (intent.needsVideo) {
      recommendations.primary = this.getVideoModel();
      recommendations.alternatives = this.getVideoModels().slice(1, 3);
      recommendations.reason = 'Video generation capability';
    } else if (intent.needsFast) {
      const fastModels = this.getFastModels();
      recommendations.primary = fastModels[0];
      recommendations.alternatives = fastModels.slice(1, 3);
      recommendations.reason = 'Optimized for speed';
    } else if (intent.needsPhoto) {
      const photoModels = this.getPhotoModels();
      recommendations.primary = photoModels[0];
      recommendations.alternatives = photoModels.slice(1, 3);
      recommendations.reason = 'Photorealistic quality';
    } else {
      // General purpose
      const general = this.getAllModels()
        .filter(m => m.runs > 50000)
        .sort((a, b) => b.runs - a.runs);
      recommendations.primary = general[0];
      recommendations.alternatives = general.slice(1, 3);
      recommendations.reason = 'Popular and versatile';
    }

    return recommendations;
  }
}

export default ReplicateCatalog;
