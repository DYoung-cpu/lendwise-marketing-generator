#!/usr/bin/env node
/**
 * Marketing Agent Coordinator - MCP Server
 *
 * This server:
 * - Auto-loads agent memory, rules, and project context on startup
 * - Exposes tools for Claude Code to access memory and save learnings
 * - Coordinates between Playwright, Memory, and Firecrawl MCP servers
 * - Solves the "Claude forgets everything" problem
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project paths
const PROJECT_ROOT = resolve(__dirname);
const MEMORY_FILE = resolve(PROJECT_ROOT, '.claude/agent-memory.json');
const RULES_FILE = resolve(PROJECT_ROOT, '.claude/rules.md');
const PROJECT_MEMORY_FILE = resolve(PROJECT_ROOT, '.claude/project-memory.md');

// In-memory cache
let agentMemory = null;
let agentRules = null;
let projectContext = null;
let lastLoadTime = null;

/**
 * Load all memory files into cache
 */
async function loadMemory() {
  try {
    console.error('[COORDINATOR] Loading memory files...');

    // Load agent memory
    const memoryContent = await readFile(MEMORY_FILE, 'utf-8');
    agentMemory = JSON.parse(memoryContent);

    // Load rules
    agentRules = await readFile(RULES_FILE, 'utf-8');

    // Load project context
    projectContext = await readFile(PROJECT_MEMORY_FILE, 'utf-8');

    lastLoadTime = new Date().toISOString();

    console.error('[COORDINATOR] Memory loaded successfully:', {
      totalGenerations: agentMemory.totalGenerations || 0,
      criticalIssues: agentMemory.criticalIssuesLog?.length || 0,
      rulesLines: agentRules.split('\n').length,
      contextLines: projectContext.split('\n').length,
      loadTime: lastLoadTime
    });

    return true;
  } catch (error) {
    console.error('[COORDINATOR] Failed to load memory:', error.message);

    // Initialize empty memory if files don't exist
    agentMemory = {
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      criticalIssuesLog: [],
      learnings: []
    };
    agentRules = '# Agent Rules\n\n## NEVER DO AGAIN\n\n## ALWAYS DO THIS\n';
    projectContext = '# Project Context\n\nNo context loaded.\n';
    lastLoadTime = new Date().toISOString();

    return false;
  }
}

/**
 * Save updated memory to file
 */
async function saveMemory() {
  try {
    await writeFile(MEMORY_FILE, JSON.stringify(agentMemory, null, 2), 'utf-8');
    console.error('[COORDINATOR] Memory saved successfully');
    return true;
  } catch (error) {
    console.error('[COORDINATOR] Failed to save memory:', error.message);
    return false;
  }
}

/**
 * Extract key insights from memory for context
 */
function getMemorySummary() {
  if (!agentMemory) return 'Memory not loaded';

  const recentIssues = (agentMemory.criticalIssuesLog || []).slice(-5);
  const recentLearnings = (agentMemory.learnings || []).slice(-5);

  return {
    stats: {
      totalGenerations: agentMemory.totalGenerations || 0,
      successRate: agentMemory.successfulGenerations / Math.max(1, agentMemory.totalGenerations) * 100,
      criticalIssuesCount: (agentMemory.criticalIssuesLog || []).length
    },
    recentIssues: recentIssues,
    recentLearnings: recentLearnings,
    lastLoadTime: lastLoadTime
  };
}

// Initialize MCP server
const server = new Server(
  {
    name: 'marketing-agent-coordinator',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

/**
 * Tool: get_agent_context
 * Returns all agent memory, rules, and project context
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_agent_context',
        description: 'Load complete agent memory, rules, and project context. Use this at the start of every session to remember previous learnings.',
        inputSchema: {
          type: 'object',
          properties: {
            summary: {
              type: 'boolean',
              description: 'If true, returns only a summary. If false, returns full context.',
              default: false
            }
          }
        }
      },
      {
        name: 'get_memory_summary',
        description: 'Get a quick summary of agent memory stats and recent learnings',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'save_learning',
        description: 'Save a new learning to agent memory for future reference',
        inputSchema: {
          type: 'object',
          properties: {
            learning: {
              type: 'object',
              description: 'Learning object with fields: category, description, solution, timestamp',
              properties: {
                category: {
                  type: 'string',
                  description: 'Category: workflow, quality, design, technical, etc.'
                },
                description: {
                  type: 'string',
                  description: 'Description of what was learned'
                },
                solution: {
                  type: 'string',
                  description: 'The solution or approach that worked'
                }
              },
              required: ['category', 'description', 'solution']
            }
          },
          required: ['learning']
        }
      },
      {
        name: 'log_critical_issue',
        description: 'Log a critical issue to track patterns and prevent recurrence',
        inputSchema: {
          type: 'object',
          properties: {
            issue: {
              type: 'object',
              description: 'Issue object with fields: type, description, resolution',
              properties: {
                type: {
                  type: 'string',
                  description: 'Type of issue: spelling_error, layout_issue, quality_failure, etc.'
                },
                description: {
                  type: 'string',
                  description: 'Detailed description of the issue'
                },
                resolution: {
                  type: 'string',
                  description: 'How the issue was resolved'
                }
              },
              required: ['type', 'description']
            }
          },
          required: ['issue']
        }
      },
      {
        name: 'reload_memory',
        description: 'Reload memory files from disk (useful if they were updated externally)',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_agent_context': {
        // Ensure memory is loaded
        if (!agentMemory) {
          await loadMemory();
        }

        const summary = args?.summary || false;

        if (summary) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(getMemorySummary(), null, 2)
            }]
          };
        }

        // Return full context
        const fullContext = {
          memory: agentMemory,
          rules: agentRules,
          projectContext: projectContext,
          loadTime: lastLoadTime,
          message: 'Complete agent context loaded. Review memory, rules, and project context before proceeding.'
        };

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(fullContext, null, 2)
          }]
        };
      }

      case 'get_memory_summary': {
        if (!agentMemory) {
          await loadMemory();
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(getMemorySummary(), null, 2)
          }]
        };
      }

      case 'save_learning': {
        if (!agentMemory) {
          await loadMemory();
        }

        const learning = args.learning;
        learning.timestamp = new Date().toISOString();

        agentMemory.learnings = agentMemory.learnings || [];
        agentMemory.learnings.push(learning);

        await saveMemory();

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Learning saved successfully',
              learning: learning
            }, null, 2)
          }]
        };
      }

      case 'log_critical_issue': {
        if (!agentMemory) {
          await loadMemory();
        }

        const issue = args.issue;
        issue.timestamp = new Date().toISOString();

        agentMemory.criticalIssuesLog = agentMemory.criticalIssuesLog || [];
        agentMemory.criticalIssuesLog.push(issue);

        await saveMemory();

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Critical issue logged',
              issue: issue
            }, null, 2)
          }]
        };
      }

      case 'reload_memory': {
        await loadMemory();

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Memory reloaded from disk',
              summary: getMemorySummary()
            }, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: error.message
        }, null, 2)
      }],
      isError: true
    };
  }
});

/**
 * Start the MCP server
 */
async function main() {
  console.error('[COORDINATOR] Starting Marketing Agent Coordinator...');

  // Load memory on startup
  await loadMemory();

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[COORDINATOR] Marketing Agent Coordinator ready!');
  console.error('[COORDINATOR] Tools available:');
  console.error('[COORDINATOR]   - get_agent_context');
  console.error('[COORDINATOR]   - get_memory_summary');
  console.error('[COORDINATOR]   - save_learning');
  console.error('[COORDINATOR]   - log_critical_issue');
  console.error('[COORDINATOR]   - reload_memory');
}

// Handle process events
process.on('SIGINT', () => {
  console.error('[COORDINATOR] Shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('[COORDINATOR] Uncaught exception:', error);
  process.exit(1);
});

main().catch((error) => {
  console.error('[COORDINATOR] Fatal error:', error);
  process.exit(1);
});
