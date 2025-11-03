class LearningSystem {
  constructor(supabase) {
    this.supabase = supabase;
    this.localMemory = new Map();
    this.modelPerformance = new Map();
    console.log('💾 Learning System initialized with Supabase:', !!supabase);
  }

  async loadHistory() {
    if (!this.supabase) {
      console.log('📚 Using local memory only (no Supabase)');
      return;
    }

    try {
      const { data } = await this.supabase
        .from('model_performance')
        .select('*');

      if (data) {
        data.forEach(record => {
          this.modelPerformance.set(record.model_id, record);
        });
      }

      console.log(`📊 Loaded performance data for ${this.modelPerformance.size} models`);
    } catch (error) {
      console.warn('Could not load history:', error.message);
    }
  }

  async recordOutcome(intent, result) {
    console.log('\n' + '='.repeat(60));
    console.log('💾 ATTEMPTING TO SAVE PERFORMANCE DATA');
    console.log('='.repeat(60));
    console.log('Intent Type:', intent.type);
    console.log('Model Used:', result.model);
    console.log('Success:', result.success);
    console.log('Quality:', result.validation?.overall || 'N/A');

    // Update local memory first
    const key = `${intent.type}_${result.model}`;
    const existing = this.localMemory.get(key) || { attempts: 0, successes: 0, totalQuality: 0 };
    existing.attempts++;
    if (result.success) {
      existing.successes++;
      existing.totalQuality += (result.validation?.overall || 0);
    }
    this.localMemory.set(key, existing);
    console.log('📝 Local memory updated:', existing);

    // Check if we have Supabase
    if (!this.supabase) {
      console.error('❌ NO SUPABASE CONNECTION - DATA WILL BE LOST ON RESTART');
      return;
    }

    // Create the record for generation_history
    const record = {
      intent_type: intent.type || 'unknown',
      model: result.model || 'unknown',
      success: result.success || false,
      quality: result.validation?.overall || 0,
      prompt: JSON.stringify(intent),
      result_url: result.url || '',
      timestamp: new Date().toISOString()
    };

    console.log('📝 Saving to generation_history...');

    // Save to generation_history
    try {
      const { data, error } = await this.supabase
        .from('generation_history')
        .insert(record)
        .select();

      if (error) {
        console.error('❌ GENERATION HISTORY SAVE FAILED:', error.message);
        console.error('Full error:', error);
        console.error('Record attempted:', record);
      } else {
        console.log('✅ SAVED TO GENERATION_HISTORY:', data);
      }
    } catch (err) {
      console.error('❌ EXCEPTION saving generation_history:', err);
    }

    // Update model_performance
    await this.updateModelPerformance(result.model, result.success, result.validation?.overall);
  }

  async updateModelPerformance(modelId, success, quality) {
    if (!this.supabase) return;

    console.log('📊 Updating model performance for:', modelId);

    try {
      // Get existing record
      const { data: existing } = await this.supabase
        .from('model_performance')
        .select('*')
        .eq('model_id', modelId)
        .single();

      const updates = {
        model_id: modelId,
        success_count: (existing?.success_count || 0) + (success ? 1 : 0),
        failure_count: (existing?.failure_count || 0) + (success ? 0 : 1),
        average_quality: existing
          ? ((existing.average_quality * (existing.success_count || 0)) + (quality || 0)) / ((existing.success_count || 0) + 1)
          : (quality || 0),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('model_performance')
        .upsert(updates)
        .select();

      if (error) {
        console.error('❌ Model performance update failed:', error);
      } else {
        console.log('✅ Model performance updated:', data);
      }
    } catch (err) {
      console.error('❌ Performance update exception:', err);
    }
  }

  getPerformanceStats() {
    return {
      models: Array.from(this.modelPerformance.entries()),
      patterns: Array.from(this.localMemory.entries())
    };
  }
}

export default LearningSystem;
