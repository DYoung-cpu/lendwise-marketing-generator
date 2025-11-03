class VisualAgent {
  constructor(replicate, catalog) {
    this.replicate = replicate;
    this.catalog = catalog;
  }

  async generateImage(prompt, intent) {
    // Select best model based on intent
    const model = await this.selectModel(intent);
    console.log(`🎨 Using model: ${model.name}`);

    try {
      const output = await this.replicate.run(model.id, {
        input: {
          prompt: prompt,
          width: 1024,
          height: 1024,
          num_inference_steps: intent.needsText ? 50 : 28
        }
      });

      let url = Array.isArray(output) ? output[0] : output;
      if (typeof url === 'object' && url !== null) {
        url = typeof url.url === 'function' ? url.url() : url.url || String(url);
      }

      return {
        success: true,
        url: String(url),
        model: model.name,
        type: 'image'
      };

    } catch (error) {
      console.error('Generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateVideo(prompt, intent) {
    const model = this.catalog.getVideoModel();
    console.log(`🎬 Using video model: ${model.name}`);

    const output = await this.replicate.run(model.id, {
      input: {
        prompt: prompt,
        duration: 5,
        fps: 24
      }
    });

    return {
      success: true,
      url: output,
      model: model.name,
      type: 'video'
    };
  }

  async selectModel(intent) {
    // Use intelligent recommendation system
    const recommendation = this.catalog.getRecommendation(intent);

    // If alternative model requested (after failed attempt), use next best
    if (intent.preferAlternativeModel && recommendation.alternatives?.length > 0) {
      const alternativeIndex = intent.alternativeAttempt || 0;
      const alternative = recommendation.alternatives[alternativeIndex];

      if (alternative) {
        console.log(`  🔄 Trying alternative model: ${alternative.name}`);
        console.log(`  📝 Reason: ${recommendation.reason}`);
        return alternative;
      }
    }

    if (recommendation.primary) {
      console.log(`  🎯 Selected: ${recommendation.primary.name}`);
      console.log(`  📝 Reason: ${recommendation.reason}`);
      if (recommendation.primary.enriched) {
        console.log(`  📊 Runs: ${recommendation.primary.runCount?.toLocaleString() || 'N/A'}`);
      }
      return recommendation.primary;
    }

    // Fallback to scoring system
    const models = this.catalog.getAllModels();
    const scores = models.map(model => ({
      model,
      score: this.scoreModel(model, intent)
    }));

    scores.sort((a, b) => b.score - a.score);
    return scores[0].model;
  }

  scoreModel(model, intent) {
    let score = 0;

    // Text rendering needs
    if (intent.needsText) {
      if (model.name.includes('Imagen 3')) score += 50;
      if (model.name.includes('Ideogram')) score += 40;
      if (model.name.includes('playground')) score += 30;
      if (model.name.includes('flux')) score -= 20; // Bad for text
    }

    // Photorealistic needs
    if (intent.needsPhoto) {
      if (model.name.includes('FLUX 1.1 Pro')) score += 50;
      if (model.name.includes('SDXL')) score += 20;
    }

    // Speed needs
    if (intent.needsFast) {
      if (model.name.includes('Lightning')) score += 30;
      if (model.name.includes('schnell')) score += 30;
    }

    return score;
  }
}

export default VisualAgent;
