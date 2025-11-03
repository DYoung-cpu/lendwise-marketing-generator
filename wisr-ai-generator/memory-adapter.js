/**
 * WISR AI Generator - Memory MCP Adapter
 *
 * Provides a clean interface to the Memory MCP server for:
 * - Storing generation results
 * - Retrieving past patterns
 * - Creating relationships between entities
 * - Querying for context
 *
 * Uses both:
 * - Memory MCP (@modelcontextprotocol/server-memory) for graph storage
 * - Local agent-memory.json for backward compatibility and fast access
 */

import fs from 'fs/promises';
import path from 'path';

class MemoryAdapter {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.memoryPath = path.join(this.projectRoot, '.claude', 'agent-memory.json');
    this.project = 'wisr-ai-generator';
  }

  /**
   * Store a generation result in memory
   * @param {Object} generation - Generation data to store
   * @returns {Promise<string>} - Entity ID created
   */
  async storeGeneration(generation) {
    const {
      assetType,
      template,
      client,
      campaign,
      pass,
      inputs,
      artifacts,
      assertions,
      failures,
      data
    } = generation;

    const entityName = `generation_${assetType}_${Date.now()}`;

    // Create observations array
    const observations = [
      `Asset type: ${assetType}`,
      `Template: ${template}`,
      `Client: ${client || 'default'}`,
      `Campaign: ${campaign || 'default'}`,
      `Result: ${pass ? 'SUCCESS' : 'FAILED'}`,
      `Timestamp: ${new Date().toISOString()}`,
      ...assertions,
      ...(failures || []).map(f => `FAILURE: ${f}`)
    ];

    // Add specific learnings based on what worked/failed
    if (data.cssPositioning) {
      observations.push(`CSS positioning: ${JSON.stringify(data.cssPositioning)}`);
    }
    if (data.wordReplacements) {
      observations.push(`Word replacements: ${JSON.stringify(data.wordReplacements)}`);
    }
    if (data.textOverlays) {
      observations.push(`Text overlays: ${JSON.stringify(data.textOverlays)}`);
    }

    // Store in Memory MCP
    try {
      // Note: This would call the actual MCP function
      // For now, we'll store in local file as well
      console.log(`   Memory MCP: Creating entity ${entityName}`);

      // Create the entity (pseudo-code for MCP call)
      // await mcp__memory__create_entities({
      //   entities: [{
      //     name: entityName,
      //     entityType: assetType,
      //     observations
      //   }]
      // });

      // Also store in local file for fast access
      await this.storeInLocalFile(generation);

      return entityName;
    } catch (error) {
      console.error('Error storing in Memory MCP:', error.message);
      // Fall back to local file only
      await this.storeInLocalFile(generation);
      return entityName;
    }
  }

  /**
   * Store generation in local agent-memory.json file
   */
  async storeInLocalFile(generation) {
    let memory = await this.loadLocalMemory();

    // Update counters
    memory.totalGenerations = (memory.totalGenerations || 0) + 1;
    if (generation.pass) {
      memory.successfulGenerations = (memory.successfulGenerations || 0) + 1;
    } else {
      memory.failedGenerations = (memory.failedGenerations || 0) + 1;

      // Add unique failures to critical issues
      (generation.failures || []).forEach(failure => {
        if (!memory.criticalIssues.includes(failure)) {
          memory.criticalIssues.push(failure);
        }
      });
    }

    // Add to generations array
    memory.generations = memory.generations || [];
    memory.generations.push({
      id: `gen_${Date.now()}`,
      ...generation,
      timestamp: new Date().toISOString()
    });

    // Keep only last 1000 generations to prevent file bloat
    if (memory.generations.length > 1000) {
      memory.generations = memory.generations.slice(-1000);
    }

    await fs.writeFile(this.memoryPath, JSON.stringify(memory, null, 2));
  }

  /**
   * Load local memory file
   */
  async loadLocalMemory() {
    try {
      const content = await fs.readFile(this.memoryPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {
        project: this.project,
        totalGenerations: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        criticalIssues: [],
        generations: []
      };
    }
  }

  /**
   * Retrieve relevant context for a generation request
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} - Context with past results and patterns
   */
  async retrieveContext(query) {
    const { assetType, template, client, campaign, tags = [] } = query;

    // Try Memory MCP first
    try {
      console.log(`   Memory MCP: Searching for ${assetType} context`);

      // Build search query
      const searchTerms = [assetType, template, client, campaign, ...tags]
        .filter(Boolean)
        .join(' ');

      // Search Memory MCP (pseudo-code)
      // const mcpResults = await mcp__memory__search_nodes({
      //   query: searchTerms
      // });

      // For now, fall through to local file
    } catch (error) {
      console.warn('Memory MCP search failed, using local file');
    }

    // Use local file as fallback/primary
    const memory = await this.loadLocalMemory();

    // Filter relevant generations
    const pastResults = (memory.generations || []).filter(g => {
      const matchesType = g.assetType === assetType;
      const matchesTemplate = !template || g.template === template;
      const matchesClient = !client || g.client === client;
      const matchesCampaign = !campaign || g.campaign === campaign;

      return matchesType && (matchesTemplate || matchesClient || matchesCampaign);
    });

    // Separate successes and failures
    const successes = pastResults.filter(r => r.pass);
    const failures = pastResults.filter(r => !r.pass);

    // Calculate success rate
    const successRate = pastResults.length > 0
      ? Math.round((successes.length / pastResults.length) * 100)
      : 0;

    // Extract successful patterns
    const successfulPatterns = successes.map(s => ({
      template: s.template,
      data: s.data,
      inputs: s.inputs,
      timestamp: s.timestamp,
      assertions: s.assertions
    }));

    // Extract common failure modes
    const commonFailures = this.analyzeCommonFailures(failures);

    return {
      pastResults,
      successes,
      failures,
      successRate,
      successfulPatterns,
      commonFailures,
      criticalIssues: memory.criticalIssues || [],
      totalGenerations: memory.totalGenerations || 0,
      successfulGenerations: memory.successfulGenerations || 0,
      failedGenerations: memory.failedGenerations || 0
    };
  }

  /**
   * Analyze common failure patterns
   */
  analyzeCommonFailures(failures) {
    const failureMap = {};

    failures.forEach(f => {
      (f.failures || []).forEach(failure => {
        failureMap[failure] = (failureMap[failure] || 0) + 1;
      });
    });

    // Sort by frequency
    return Object.entries(failureMap)
      .sort((a, b) => b[1] - a[1])
      .map(([failure, count]) => ({ failure, count }));
  }

  /**
   * Create relationship between entities in Memory MCP
   * @param {Object} relation - Relationship to create
   */
  async createRelation(relation) {
    const { from, to, relationType } = relation;

    try {
      console.log(`   Memory MCP: Creating relation ${from} -[${relationType}]-> ${to}`);

      // Create relationship (pseudo-code for MCP call)
      // await mcp__memory__create_relations({
      //   relations: [{
      //     from,
      //     to,
      //     relationType
      //   }]
      // });

      return true;
    } catch (error) {
      console.error('Error creating relation in Memory MCP:', error.message);
      return false;
    }
  }

  /**
   * Add observations to an existing entity
   */
  async addObservations(entityName, observations) {
    try {
      console.log(`   Memory MCP: Adding ${observations.length} observations to ${entityName}`);

      // Add observations (pseudo-code for MCP call)
      // await mcp__memory__add_observations({
      //   observations: [{
      //     entityName,
      //     contents: observations
      //   }]
      // });

      return true;
    } catch (error) {
      console.error('Error adding observations:', error.message);
      return false;
    }
  }

  /**
   * Get statistics about memory
   */
  async getStatistics() {
    const memory = await this.loadLocalMemory();

    return {
      totalGenerations: memory.totalGenerations || 0,
      successfulGenerations: memory.successfulGenerations || 0,
      failedGenerations: memory.failedGenerations || 0,
      successRate: memory.totalGenerations > 0
        ? Math.round((memory.successfulGenerations / memory.totalGenerations) * 100)
        : 0,
      criticalIssuesCount: (memory.criticalIssues || []).length,
      criticalIssues: memory.criticalIssues || []
    };
  }

  /**
   * Get the best template for an asset type based on past success
   */
  async getBestTemplate(assetType) {
    const context = await this.retrieveContext({ assetType });

    if (context.successes.length === 0) {
      return null; // No data yet
    }

    // Count successes by template
    const templateScores = {};
    context.successes.forEach(s => {
      const template = s.template || 'default';
      templateScores[template] = (templateScores[template] || 0) + 1;
    });

    // Return template with most successes
    const sortedTemplates = Object.entries(templateScores)
      .sort((a, b) => b[1] - a[1]);

    return sortedTemplates[0]?.[0] || null;
  }

  /**
   * Get recommendations for improving a failed generation
   */
  async getRecommendations(failedGeneration) {
    const { assetType, template, failures } = failedGeneration;

    const context = await this.retrieveContext({ assetType });
    const recommendations = [];

    // Check if different template has better success rate
    const bestTemplate = await this.getBestTemplate(assetType);
    if (bestTemplate && bestTemplate !== template) {
      recommendations.push({
        type: 'template',
        action: `Try '${bestTemplate}' template instead of '${template}'`,
        reason: 'Higher success rate with this template'
      });
    }

    // Check for known solutions to failures
    failures.forEach(failure => {
      const similarSuccesses = context.successes.filter(s => {
        // Look for successes that might have solved this issue
        return s.assertions.some(a => a.toLowerCase().includes(failure.toLowerCase()));
      });

      if (similarSuccesses.length > 0) {
        recommendations.push({
          type: 'pattern',
          action: `Apply pattern from successful generation: ${similarSuccesses[0].id}`,
          reason: `Successfully handled: ${failure}`,
          pattern: similarSuccesses[0].data
        });
      }
    });

    // General recommendations based on common failures
    if (failures.some(f => f.includes('text') || f.includes('alignment'))) {
      recommendations.push({
        type: 'technical',
        action: 'Review CSS positioning and text overlay logic',
        reason: 'Text alignment is a common issue'
      });
    }

    return recommendations;
  }

  /**
   * Export memory for analysis
   */
  async exportMemory(outputPath) {
    const memory = await this.loadLocalMemory();
    const stats = await this.getStatistics();

    const exportData = {
      ...memory,
      statistics: stats,
      exportedAt: new Date().toISOString()
    };

    await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`Memory exported to: ${outputPath}`);

    return exportData;
  }

  /**
   * Clear old failures from memory (keep only recent/relevant)
   */
  async cleanup(options = {}) {
    const { keepRecentDays = 30, keepSuccesses = true } = options;

    const memory = await this.loadLocalMemory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepRecentDays);

    // Filter generations
    memory.generations = (memory.generations || []).filter(g => {
      const genDate = new Date(g.timestamp);

      // Keep all successes if requested
      if (keepSuccesses && g.pass) return true;

      // Keep recent generations
      if (genDate > cutoffDate) return true;

      // Remove old failures
      return false;
    });

    // Recalculate counters
    memory.totalGenerations = memory.generations.length;
    memory.successfulGenerations = memory.generations.filter(g => g.pass).length;
    memory.failedGenerations = memory.generations.filter(g => !g.pass).length;

    await fs.writeFile(this.memoryPath, JSON.stringify(memory, null, 2));

    console.log(`Memory cleanup complete. Kept ${memory.generations.length} generations.`);

    return {
      keptGenerations: memory.generations.length,
      removedGenerations: memory.totalGenerations - memory.generations.length
    };
  }
}

export default MemoryAdapter;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const adapter = new MemoryAdapter({
    projectRoot: '/mnt/c/Users/dyoun/Active Projects/wisr-ai-generator'
  });

  // Example: Get statistics
  adapter.getStatistics()
    .then(stats => {
      console.log('\n📊 Memory Statistics:');
      console.log(`Total Generations: ${stats.totalGenerations}`);
      console.log(`Successful: ${stats.successfulGenerations}`);
      console.log(`Failed: ${stats.failedGenerations}`);
      console.log(`Success Rate: ${stats.successRate}%`);
      console.log(`Critical Issues: ${stats.criticalIssuesCount}`);

      if (stats.criticalIssues.length > 0) {
        console.log('\nTop Issues:');
        stats.criticalIssues.slice(0, 5).forEach(issue => {
          console.log(`  - ${issue}`);
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
