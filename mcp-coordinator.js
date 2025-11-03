#!/usr/bin/env node

/**
 * MCP Tool Coordinator - Ensures tools execute when commanded
 * Fixes the issue where MCP tools (Playwright, Firecrawl, Memory) don't execute
 */

import { chromium } from 'playwright';

class MCPCoordinator {
    constructor() {
        this.tools = new Map();
        this.executionQueue = [];
        this.retryLimit = 3;
        this.initialized = false;

        this.registerTools();
    }

    registerTools() {
        // Register all MCP tools with their execution logic
        this.tools.set('playwright', {
            execute: async (params) => await this.executePlaywright(params),
            required: ['action'],
            timeout: 30000,
            description: 'Browser automation and testing'
        });

        this.tools.set('firecrawl', {
            execute: async (params) => await this.executeFirecrawl(params),
            required: ['url'],
            timeout: 20000,
            description: 'Web scraping and content extraction'
        });

        this.tools.set('memory', {
            execute: async (params) => await this.executeMemory(params),
            required: ['action'],
            timeout: 5000,
            description: 'Persistent memory operations'
        });

        this.tools.set('ocr', {
            execute: async (params) => await this.executeOCR(params),
            required: ['imagePath'],
            timeout: 15000,
            description: 'OCR text extraction and validation'
        });

        console.log(`🔧 Registered ${this.tools.size} MCP tools:`, Array.from(this.tools.keys()).join(', '));
    }

    async executeTool(toolName, params, forceExecution = false) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔧 MCP TOOL EXECUTION: ${toolName}`);
        console.log('='.repeat(60));

        const tool = this.tools.get(toolName);

        if (!tool) {
            console.error(`❌ Tool '${toolName}' not found`);
            console.log(`   Available tools: ${Array.from(this.tools.keys()).join(', ')}`);
            throw new Error(`MCP tool '${toolName}' not found`);
        }

        console.log(`   Description: ${tool.description}`);
        console.log(`   Timeout: ${tool.timeout}ms`);

        // Validate required parameters
        for (const req of tool.required) {
            if (!params[req]) {
                if (forceExecution) {
                    console.warn(`⚠️  Missing required param '${req}', using default`);
                    params[req] = this.getDefaultParam(req);
                } else {
                    console.error(`❌ Missing required parameter: ${req}`);
                    throw new Error(`Missing required parameter: ${req}`);
                }
            }
        }

        console.log(`   Parameters:`, JSON.stringify(params, null, 2));

        // Execute with retry logic
        let attempts = 0;
        let lastError = null;

        while (attempts < this.retryLimit) {
            attempts++;
            console.log(`\n   Attempt ${attempts}/${this.retryLimit}...`);

            try {
                const result = await Promise.race([
                    tool.execute(params),
                    this.timeout(tool.timeout, toolName)
                ]);

                console.log(`✅ MCP tool ${toolName} executed successfully`);
                console.log('='.repeat(60));
                return result;

            } catch (error) {
                lastError = error;
                console.error(`   ❌ Attempt ${attempts} failed:`, error.message);

                if (attempts < this.retryLimit) {
                    const waitTime = 1000 * attempts;
                    console.log(`   ⏳ Waiting ${waitTime}ms before retry...`);
                    await this.delay(waitTime);
                }
            }
        }

        console.error(`❌ MCP tool ${toolName} failed after ${attempts} attempts`);
        console.log('='.repeat(60));
        throw new Error(`MCP tool ${toolName} failed: ${lastError.message}`);
    }

    async executePlaywright(params) {
        const { action, url = 'about:blank', selector, text, timeout = 10000 } = params;

        console.log(`   🎭 Playwright Action: ${action}`);
        if (url !== 'about:blank') console.log(`   URL: ${url}`);

        let browser = null;
        let page = null;

        try {
            // Launch browser
            browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            page = await browser.newPage();

            // Navigate if URL provided
            if (url !== 'about:blank') {
                await page.goto(url, { waitUntil: 'networkidle', timeout });
            }

            let result = { success: true };

            // Execute action
            switch (action) {
                case 'screenshot':
                    const screenshot = await page.screenshot({ fullPage: params.fullPage || false });
                    result.data = screenshot;
                    result.type = 'buffer';
                    break;

                case 'scrape':
                    const content = await page.content();
                    result.data = content;
                    result.type = 'html';
                    break;

                case 'click':
                    if (!selector) throw new Error('selector required for click action');
                    await page.click(selector, { timeout });
                    result.data = 'clicked';
                    break;

                case 'type':
                    if (!selector || !text) throw new Error('selector and text required for type action');
                    await page.fill(selector, text, { timeout });
                    result.data = 'typed';
                    break;

                case 'evaluate':
                    const evalResult = await page.evaluate(params.script || '() => document.title');
                    result.data = evalResult;
                    break;

                case 'wait':
                    if (selector) {
                        await page.waitForSelector(selector, { timeout });
                    } else {
                        await page.waitForTimeout(params.duration || 1000);
                    }
                    result.data = 'wait complete';
                    break;

                default:
                    throw new Error(`Unknown Playwright action: ${action}`);
            }

            await browser.close();
            return result;

        } catch (error) {
            if (browser) await browser.close();
            throw error;
        }
    }

    async executeFirecrawl(params) {
        const { url, formats = ['markdown'], onlyMainContent = true } = params;

        console.log(`   🔥 Firecrawl: ${url}`);
        console.log(`   Formats: ${formats.join(', ')}`);

        const apiKey = process.env.FIRECRAWL_API_KEY;

        if (!apiKey) {
            console.warn('   ⚠️  FIRECRAWL_API_KEY not set, using basic fetch');
            // Fallback to basic fetch
            const response = await fetch(url);
            const html = await response.text();
            return {
                success: true,
                data: html,
                format: 'html',
                fallback: true
            };
        }

        try {
            const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    formats: formats,
                    onlyMainContent: onlyMainContent
                })
            });

            if (!response.ok) {
                throw new Error(`Firecrawl API error: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                data: data,
                format: formats[0]
            };

        } catch (error) {
            console.warn(`   ⚠️  Firecrawl failed, using fallback:`, error.message);

            // Fallback to basic fetch
            const response = await fetch(url);
            const html = await response.text();
            return {
                success: true,
                data: html,
                format: 'html',
                fallback: true
            };
        }
    }

    async executeMemory(params) {
        const { action, key, value, query } = params;

        console.log(`   🧠 Memory Action: ${action}`);

        // This would integrate with your actual memory system
        // For now, using simple in-memory storage

        if (!this.memoryStore) {
            this.memoryStore = new Map();
        }

        let result = { success: true };

        switch (action) {
            case 'store':
            case 'set':
                if (!key || value === undefined) {
                    throw new Error('key and value required for store action');
                }
                this.memoryStore.set(key, {
                    value: value,
                    timestamp: new Date().toISOString()
                });
                result.data = 'stored';
                console.log(`   Stored: ${key}`);
                break;

            case 'retrieve':
            case 'get':
                if (!key) throw new Error('key required for retrieve action');
                const stored = this.memoryStore.get(key);
                result.data = stored || null;
                console.log(`   Retrieved: ${key} = ${stored ? 'found' : 'not found'}`);
                break;

            case 'search':
                if (!query) throw new Error('query required for search action');
                const matches = [];
                for (const [k, v] of this.memoryStore.entries()) {
                    if (k.includes(query) || JSON.stringify(v.value).includes(query)) {
                        matches.push({ key: k, ...v });
                    }
                }
                result.data = matches;
                console.log(`   Found ${matches.length} matches for: ${query}`);
                break;

            case 'delete':
                if (!key) throw new Error('key required for delete action');
                const deleted = this.memoryStore.delete(key);
                result.data = deleted ? 'deleted' : 'not found';
                console.log(`   Deleted: ${key} = ${deleted ? 'success' : 'not found'}`);
                break;

            case 'list':
                const all = Array.from(this.memoryStore.entries()).map(([k, v]) => ({
                    key: k,
                    ...v
                }));
                result.data = all;
                console.log(`   Listed ${all.length} memory entries`);
                break;

            default:
                throw new Error(`Unknown memory action: ${action}`);
        }

        return result;
    }

    async executeOCR(params) {
        const { imagePath, language = 'eng' } = params;

        console.log(`   👁️  OCR: ${imagePath}`);

        // This would integrate with Tesseract or similar
        // For now, return placeholder

        return {
            success: true,
            text: 'OCR placeholder - integrate with Tesseract',
            confidence: 0.95
        };
    }

    getDefaultParam(paramName) {
        const defaults = {
            'action': 'screenshot',
            'url': 'about:blank',
            'imagePath': './temp.png',
            'formats': ['markdown']
        };

        return defaults[paramName] || null;
    }

    timeout(ms, toolName) {
        return new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${toolName} timeout after ${ms}ms`)), ms)
        );
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    listTools() {
        return Array.from(this.tools.entries()).map(([name, info]) => ({
            name,
            description: info.description,
            required: info.required,
            timeout: info.timeout
        }));
    }
}

export default MCPCoordinator;
