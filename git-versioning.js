#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Git Versioning
 * Tracks all prompt changes with version control
 */

class GitVersioning {
    constructor(repoPath = '/mnt/c/Users/dyoun/Active Projects') {
        this.repoPath = repoPath;
        this.promptsDir = path.join(repoPath, 'prompts');
        this.historyDir = path.join(repoPath, 'prompt-history');
    }

    /**
     * Initialize git tracking for prompts
     */
    async initialize() {
        console.log('\n📁 Initializing git versioning...');

        try {
            // Ensure directories exist
            await fs.mkdir(this.promptsDir, { recursive: true });
            await fs.mkdir(this.historyDir, { recursive: true });

            // Check if git is initialized
            try {
                await execAsync('git rev-parse --git-dir', { cwd: this.repoPath });
                console.log('✅ Git repository already initialized');
            } catch {
                console.log('⚠️  Git not initialized - creating new repository');
                await execAsync('git init', { cwd: this.repoPath });
                await execAsync('git config user.name "Autonomous Quality Agent"', { cwd: this.repoPath });
                await execAsync('git config user.email "agent@lendwise.ai"', { cwd: this.repoPath });
            }

            console.log('✅ Git versioning ready');
        } catch (error) {
            console.error(`❌ Git initialization failed: ${error.message}`);
        }
    }

    /**
     * Save prompt version
     * @param {string} templateName - Template name
     * @param {string} promptContent - Prompt text
     * @param {number} attempt - Attempt number
     * @param {Object} strategy - Strategy used
     * @returns {Promise<string>} Commit hash
     */
    async savePromptVersion(templateName, promptContent, attempt, strategy = null) {
        console.log(`\n💾 Saving prompt version for ${templateName} (attempt ${attempt})...`);

        try {
            // Create safe filename
            const safeTemplateName = templateName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${safeTemplateName}-attempt-${attempt}-${timestamp}.txt`;
            const filepath = path.join(this.promptsDir, filename);

            // Add metadata header to prompt
            const metadata = `# Prompt Version Metadata
# Template: ${templateName}
# Attempt: ${attempt}
# Strategy: ${strategy ? strategy.name : 'baseline'}
# Category: ${strategy ? strategy.category : 'none'}
# Timestamp: ${new Date().toISOString()}
# ================================================

${promptContent}`;

            // Write prompt to file
            await fs.writeFile(filepath, metadata);

            // Git add and commit
            await execAsync(`git add "${filepath}"`, { cwd: this.repoPath });

            const commitMessage = strategy
                ? `Attempt ${attempt}: ${templateName} - ${strategy.name} (${strategy.category})`
                : `Attempt ${attempt}: ${templateName} - baseline`;

            const { stdout } = await execAsync(
                `git commit -m "${commitMessage}" --allow-empty`,
                { cwd: this.repoPath }
            );

            // Get commit hash
            const { stdout: hash } = await execAsync('git rev-parse HEAD', { cwd: this.repoPath });
            const commitHash = hash.trim().substring(0, 7);

            console.log(`✅ Saved as ${filename}`);
            console.log(`   Commit: ${commitHash}`);

            return commitHash;

        } catch (error) {
            console.error(`❌ Failed to save prompt version: ${error.message}`);
            return null;
        }
    }

    /**
     * Get prompt history for a template
     * @param {string} templateName - Template name
     * @returns {Promise<Array>} Array of prompt versions
     */
    async getPromptHistory(templateName) {
        console.log(`\n📖 Loading prompt history for ${templateName}...`);

        try {
            const safeTemplateName = templateName.replace(/[^a-z0-9]/gi, '-').toLowerCase();

            // Get git log for template prompts
            const { stdout } = await execAsync(
                `git log --all --oneline -- "${this.promptsDir}/${safeTemplateName}-*"`,
                { cwd: this.repoPath }
            );

            const commits = stdout.trim().split('\n').filter(line => line.length > 0);

            console.log(`✅ Found ${commits.length} versions`);

            return commits.map(commit => {
                const [hash, ...messageParts] = commit.split(' ');
                return {
                    hash,
                    message: messageParts.join(' ')
                };
            });

        } catch (error) {
            console.log(`⚠️  No history found for ${templateName}`);
            return [];
        }
    }

    /**
     * Revert to a previous prompt version
     * @param {string} commitHash - Git commit hash
     * @returns {Promise<string>} Prompt content
     */
    async revertToVersion(commitHash) {
        console.log(`\n⏮️  Reverting to version ${commitHash}...`);

        try {
            const { stdout } = await execAsync(
                `git show ${commitHash}`,
                { cwd: this.repoPath }
            );

            // Extract prompt content (skip git diff header and metadata)
            const lines = stdout.split('\n');
            const contentStart = lines.findIndex(line => line.includes('# ================================================'));

            if (contentStart === -1) {
                throw new Error('Could not find prompt content in commit');
            }

            const promptContent = lines.slice(contentStart + 2).join('\n');

            console.log(`✅ Reverted to version ${commitHash}`);
            return promptContent;

        } catch (error) {
            console.error(`❌ Failed to revert: ${error.message}`);
            return null;
        }
    }

    /**
     * Compare two prompt versions
     * @param {string} hash1 - First commit hash
     * @param {string} hash2 - Second commit hash
     * @returns {Promise<string>} Diff output
     */
    async compareVersions(hash1, hash2) {
        console.log(`\n🔍 Comparing ${hash1} vs ${hash2}...`);

        try {
            const { stdout } = await execAsync(
                `git diff ${hash1} ${hash2}`,
                { cwd: this.repoPath }
            );

            console.log('✅ Diff generated');
            return stdout;

        } catch (error) {
            console.error(`❌ Comparison failed: ${error.message}`);
            return '';
        }
    }

    /**
     * Export full history to JSON
     * @returns {Promise<Object>} Complete history
     */
    async exportHistory() {
        console.log('\n📤 Exporting full prompt history...');

        try {
            // Get all prompt files
            const files = await fs.readdir(this.promptsDir);
            const promptFiles = files.filter(f => f.endsWith('.txt'));

            const history = {};

            for (const file of promptFiles) {
                const filepath = path.join(this.promptsDir, file);
                const content = await fs.readFile(filepath, 'utf-8');

                // Parse metadata
                const metadataMatch = content.match(/# Template: (.+)\n# Attempt: (\d+)\n# Strategy: (.+)\n/);

                if (metadataMatch) {
                    const [, template, attempt, strategy] = metadataMatch;

                    if (!history[template]) {
                        history[template] = [];
                    }

                    history[template].push({
                        attempt: parseInt(attempt),
                        strategy,
                        filename: file,
                        content: content.split('# ================================================')[1]?.trim() || ''
                    });
                }
            }

            // Sort by attempt number
            for (const template in history) {
                history[template].sort((a, b) => a.attempt - b.attempt);
            }

            // Save to history file
            const historyPath = path.join(this.historyDir, `history-${Date.now()}.json`);
            await fs.writeFile(historyPath, JSON.stringify(history, null, 2));

            console.log(`✅ History exported to ${path.basename(historyPath)}`);

            return history;

        } catch (error) {
            console.error(`❌ Export failed: ${error.message}`);
            return {};
        }
    }

    /**
     * Create a branch for experimental strategies
     * @param {string} branchName - Branch name
     */
    async createExperimentBranch(branchName) {
        console.log(`\n🌿 Creating experiment branch: ${branchName}...`);

        try {
            const safeBranchName = branchName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

            await execAsync(`git checkout -b ${safeBranchName}`, { cwd: this.repoPath });

            console.log(`✅ Branch ${safeBranchName} created and checked out`);
            return safeBranchName;

        } catch (error) {
            console.error(`❌ Branch creation failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Merge successful experiment back to main
     * @param {string} branchName - Branch to merge
     */
    async mergeExperiment(branchName) {
        console.log(`\n🔀 Merging experiment: ${branchName}...`);

        try {
            // Switch to main
            await execAsync('git checkout main', { cwd: this.repoPath });

            // Merge branch
            await execAsync(`git merge ${branchName} --no-ff -m "Merge successful experiment: ${branchName}"`, { cwd: this.repoPath });

            console.log(`✅ Experiment ${branchName} merged successfully`);
            return true;

        } catch (error) {
            console.error(`❌ Merge failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Get summary statistics
     */
    async getSummary() {
        try {
            const { stdout: commitCount } = await execAsync(
                `git rev-list --count HEAD -- "${this.promptsDir}"`,
                { cwd: this.repoPath }
            );

            const files = await fs.readdir(this.promptsDir);
            const promptCount = files.filter(f => f.endsWith('.txt')).length;

            return {
                total_commits: parseInt(commitCount.trim()),
                total_prompts: promptCount,
                prompts_directory: this.promptsDir
            };

        } catch (error) {
            return {
                total_commits: 0,
                total_prompts: 0,
                error: error.message
            };
        }
    }
}

export default GitVersioning;
