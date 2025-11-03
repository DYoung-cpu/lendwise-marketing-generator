class BrandLearningSystem {
  constructor(supabase) {
    this.supabase = supabase;
    this.learnedPreferences = new Map();
    this.loadPreferences();
  }

  async loadPreferences() {
    if (!this.supabase) {
      console.log('📚 Using local brand learning only (no Supabase)');
      return;
    }

    try {
      const { data } = await this.supabase
        .from('brand_preferences')
        .select('*')
        .eq('active', true);

      if (data) {
        data.forEach(pref => {
          this.learnedPreferences.set(pref.issue_type, {
            solution: pref.solution,
            frequency: pref.frequency
          });
        });
      }

      console.log(`📚 Loaded ${this.learnedPreferences.size} brand preferences`);
    } catch (error) {
      console.warn('Could not load brand preferences:', error.message);
    }
  }

  async recordCritique(generationId, critique, rating) {
    console.log('\n' + '='.repeat(60));
    console.log('💬 RECORDING USER CRITIQUE');
    console.log('='.repeat(60));
    console.log(`Generation ID: ${generationId}`);
    console.log(`Rating: ${rating}/5`);
    console.log(`Critique: ${critique}`);

    // Parse critique for actionable items
    const issues = this.extractIssues(critique);
    const improvements = this.generateImprovements(issues);

    console.log(`📊 Identified ${issues.length} issues:`, issues);

    // Save critique to database
    if (this.supabase) {
      try {
        await this.supabase.from('brand_feedback').insert({
          generation_id: generationId,
          critique: critique,
          rating: rating,
          issues: issues,
          improvements: improvements,
          timestamp: new Date().toISOString()
        });
        console.log('✅ Critique saved to database');
      } catch (error) {
        console.error('❌ Failed to save critique:', error.message);
      }
    }

    // Learn from critique if rating is low
    if (rating <= 3) {
      await this.learnFromCritique(issues, improvements);
    } else {
      console.log('⭐ High rating - no changes needed');
    }

    return { issues, improvements, learned: rating <= 3 };
  }

  extractIssues(critique) {
    const issues = [];
    const patterns = {
      'too dark': 'color_too_dark',
      'too bright': 'color_too_bright',
      'unprofessional': 'lacks_professionalism',
      'hard to read': 'poor_readability',
      'wrong color': 'brand_color_mismatch',
      'blurry': 'image_quality_blur',
      'small text': 'text_too_small',
      'cluttered': 'poor_composition',
      'low quality': 'low_resolution',
      'bad photo': 'photo_quality_poor',
      'missing logo': 'logo_missing',
      'wrong font': 'font_mismatch',
      'boring': 'lacks_visual_interest',
      'confusing': 'unclear_message'
    };

    const lowerCritique = critique.toLowerCase();
    for (const [pattern, issue] of Object.entries(patterns)) {
      if (lowerCritique.includes(pattern)) {
        issues.push(issue);
      }
    }

    return issues.length > 0 ? issues : ['general_improvement_needed'];
  }

  generateImprovements(issues) {
    const improvements = {};

    const solutions = {
      'color_too_dark': 'Use brighter shade - forest green #4d8f5f instead of #2d5f3f',
      'color_too_bright': 'Use deeper shade - forest green #1d4f2f',
      'lacks_professionalism': 'Ensure business attire, confident expression, clean background',
      'poor_readability': 'Increase contrast, use larger fonts (min 16pt), clearer typography',
      'brand_color_mismatch': 'Use exact brand colors: #2d5f3f (green), #d4af37 (gold)',
      'image_quality_blur': 'Increase generation steps to 50, use higher quality model',
      'text_too_small': 'Minimum font size 18pt for body, 28pt for headers',
      'poor_composition': 'Use rule of thirds, clear visual hierarchy, more whitespace',
      'low_resolution': 'Generate at minimum 1024x1024, prefer 1536x1536 for print',
      'photo_quality_poor': 'Use professional headshot, good lighting, neutral background',
      'logo_missing': 'Ensure LendWise owl logo prominently displayed in top-left',
      'font_mismatch': 'Use brand fonts: Playfair Display for headers, Open Sans for body',
      'lacks_visual_interest': 'Add subtle textures, gradients, or design elements',
      'unclear_message': 'Simplify copy, focus on one key message, increase visual hierarchy',
      'general_improvement_needed': 'Review design principles: contrast, alignment, hierarchy, proximity'
    };

    issues.forEach(issue => {
      improvements[issue] = solutions[issue] || 'Adjust parameters and retry';
    });

    return improvements;
  }

  async learnFromCritique(issues, improvements) {
    console.log('🧠 Learning from critique...');

    for (const issue of issues) {
      // Update or insert preference
      const existing = this.learnedPreferences.get(issue);
      const frequency = existing ? existing.frequency + 1 : 1;

      if (this.supabase) {
        try {
          await this.supabase.from('brand_preferences').upsert({
            issue_type: issue,
            solution: improvements[issue],
            frequency: frequency,
            last_seen: new Date().toISOString(),
            active: true
          });
        } catch (error) {
          console.error(`Failed to save preference for ${issue}:`, error.message);
        }
      }

      this.learnedPreferences.set(issue, {
        solution: improvements[issue],
        frequency: frequency
      });

      console.log(`   ✅ Learned: ${issue} (seen ${frequency}x)`);
    }

    console.log(`🎓 Total learned preferences: ${this.learnedPreferences.size}`);
  }

  applyLearnedPreferences(prompt) {
    // Apply all frequently seen preferences to the prompt
    let enhancedPrompt = prompt;
    const appliedPreferences = [];

    for (const [issue, data] of this.learnedPreferences) {
      if (data.frequency >= 2) { // Apply if seen twice or more
        enhancedPrompt += `\n\nIMPORTANT (from user feedback): ${data.solution}`;
        appliedPreferences.push(issue);
      }
    }

    if (appliedPreferences.length > 0) {
      console.log(`🎯 Applied ${appliedPreferences.length} learned preferences:`, appliedPreferences);
    }

    return enhancedPrompt;
  }

  getLearnedPreferences() {
    const prefs = [];
    for (const [issue, data] of this.learnedPreferences) {
      prefs.push({
        issue: issue,
        solution: data.solution,
        frequency: data.frequency,
        active: data.frequency >= 2
      });
    }
    return prefs.sort((a, b) => b.frequency - a.frequency);
  }

  async clearPreference(issueType) {
    if (this.supabase) {
      await this.supabase
        .from('brand_preferences')
        .update({ active: false })
        .eq('issue_type', issueType);
    }
    this.learnedPreferences.delete(issueType);
    console.log(`🗑️  Cleared preference: ${issueType}`);
  }
}

export default BrandLearningSystem;
