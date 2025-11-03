import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import MasterOrchestrator from './orchestrator/master-orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(join(__dirname, 'ui')));

// Initialize orchestrator
const orchestrator = new MasterOrchestrator();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'Mortgage CRM',
    timestamp: new Date().toISOString()
  });
});

// Main generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const result = await orchestrator.processRequest(req.body);
    res.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get model catalog
app.get('/api/models', async (req, res) => {
  const models = await orchestrator.getModelCatalog();
  res.json(models);
});

// Get learning history
app.get('/api/performance', async (req, res) => {
  const performance = await orchestrator.getPerformanceData();
  res.json(performance);
});

// Verify memory system
app.get('/api/verify-memory', async (req, res) => {
  console.log('🔍 Verifying memory system...');

  const verification = {
    supabase_connected: !!orchestrator.learningSystem.supabase,
    local_memory: orchestrator.learningSystem.localMemory.size,
    tables: {}
  };

  if (orchestrator.learningSystem.supabase) {
    // Check each table
    const tables = ['generation_history', 'model_performance', 'learning_patterns'];
    for (const table of tables) {
      try {
        const { count, error } = await orchestrator.learningSystem.supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        verification.tables[table] = error ? `ERROR: ${error.message}` : `${count} records`;
      } catch (err) {
        verification.tables[table] = `EXCEPTION: ${err.message}`;
      }
    }
  }

  res.json(verification);
});

// Submit critique for a generation
app.post('/api/critique', async (req, res) => {
  const { generation_id, critique, rating } = req.body;

  console.log(`💬 User critique for generation ${generation_id}`);

  try {
    const result = await orchestrator.brandLearning.recordCritique(
      generation_id,
      critique,
      rating
    );

    res.json({
      success: true,
      issues: result.issues,
      improvements: result.improvements,
      learned: result.learned,
      message: result.learned
        ? 'Your feedback will improve future generations'
        : 'Thanks for the positive feedback!'
    });
  } catch (error) {
    console.error('Critique error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current brand preferences
app.get('/api/brand-preferences', async (req, res) => {
  try {
    const prefs = orchestrator.brandLearning.getLearnedPreferences();
    res.json({
      success: true,
      preferences: prefs,
      count: prefs.length,
      active: prefs.filter(p => p.active).length
    });
  } catch (error) {
    console.error('Preferences error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear a specific preference
app.delete('/api/brand-preferences/:issueType', async (req, res) => {
  try {
    await orchestrator.brandLearning.clearPreference(req.params.issueType);
    res.json({ success: true, message: 'Preference cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dreambooth Training Endpoints
// Train a Dreambooth model for an officer
app.post('/api/officers/train', async (req, res) => {
  console.log('🎯 Dreambooth training request received');
  const { officerId, trainingImages, options } = req.body;

  if (!officerId || !trainingImages || trainingImages.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'officerId and trainingImages are required'
    });
  }

  try {
    const result = await orchestrator.dreamboothAgent.trainModel(
      officerId,
      trainingImages,
      options
    );

    res.json({
      success: true,
      training_id: result.training_id,
      status: result.status,
      message: 'Training started successfully',
      validation: result.validation
    });
  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate image with Dreambooth
app.post('/api/officers/:officerId/generate', async (req, res) => {
  console.log(`🖼️ Dreambooth generation request for officer ${req.params.officerId}`);
  const { officerId } = req.params;
  const { prompt, style } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'prompt is required'
    });
  }

  try {
    const result = await orchestrator.dreamboothAgent.generateWithValidation(
      officerId,
      prompt,
      style || 'professional'
    );

    res.json({
      success: result.passed,
      generation_id: result.generation_id,
      image_url: result.image_url,
      validation: {
        score: result.validation.score,
        passed: result.passed,
        face_confidence: result.validation.checks.faceIntegrity.confidence,
        issues: result.validation.issues,
        recommendation: result.validation.recommendation
      },
      attempts: result.attempts
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate training quality
app.get('/api/officers/:officerId/validate-training', async (req, res) => {
  console.log(`🔍 Validating training quality for officer ${req.params.officerId}`);
  const { officerId } = req.params;

  try {
    const result = await orchestrator.dreamboothAgent.validateTrainingQuality(officerId);

    res.json({
      success: true,
      officerId,
      quality: result.quality,
      passed: result.passed,
      face_confidence: result.avg_face_confidence,
      recommendations: result.recommendations,
      test_results: result.test_results
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get officer training history and statistics
app.get('/api/officers/:officerId/stats', async (req, res) => {
  const { officerId } = req.params;

  try {
    if (!orchestrator.dreamboothAgent.supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      });
    }

    // Get generation stats
    const { data: generations, error: genError } = await orchestrator.dreamboothAgent.supabase
      .from('dreambooth_generations')
      .select('*')
      .eq('officer_id', officerId)
      .order('timestamp', { ascending: false });

    if (genError) throw genError;

    // Calculate statistics
    const stats = {
      officer_id: officerId,
      total_generations: generations.length,
      passed: generations.filter(g => g.passed).length,
      failed: generations.filter(g => !g.passed).length,
      pass_rate: generations.length > 0
        ? (generations.filter(g => g.passed).length / generations.length * 100).toFixed(1)
        : 0,
      avg_face_confidence: generations.length > 0
        ? (generations.reduce((sum, g) => sum + (g.face_confidence || 0), 0) / generations.length * 100).toFixed(1)
        : 0,
      avg_validation_score: generations.length > 0
        ? (generations.reduce((sum, g) => sum + (g.validation_score || 0), 0) / generations.length * 100).toFixed(1)
        : 0,
      recent_generations: generations.slice(0, 5)
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║        MORTGAGE CRM SYSTEM             ║
║        LendWise Marketing Platform     ║
╚════════════════════════════════════════╝
🚀 Server running on http://localhost:${PORT}
📊 API: http://localhost:${PORT}/api
🎨 UI: http://localhost:${PORT}
  `);
});
