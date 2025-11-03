#!/usr/bin/env node

import fs from 'fs/promises';

/**
 * Performance Tracker - Tracks cost, time, and success metrics
 */
class PerformanceTracker {
    constructor(logPath = '/mnt/c/Users/dyoun/Active Projects/performance-log.json') {
        this.logPath = logPath;
        this.sessionStart = Date.now();
        this.metrics = {
            templates: {},
            total_cost: 0,
            total_time: 0,
            total_attempts: 0,
            successful_templates: 0
        };
    }

    async recordAttempt(templateName, attemptNum, duration, cost, success, score) {
        if (!this.metrics.templates[templateName]) {
            this.metrics.templates[templateName] = {
                attempts: [],
                total_cost: 0,
                total_time: 0,
                best_score: 0,
                success: false
            };
        }

        const template = this.metrics.templates[templateName];
        template.attempts.push({
            attempt: attemptNum,
            duration,
            cost,
            success,
            score,
            timestamp: new Date().toISOString()
        });

        template.total_cost += cost;
        template.total_time += duration;
        template.best_score = Math.max(template.best_score, score);
        if (success) template.success = true;

        this.metrics.total_cost += cost;
        this.metrics.total_time += duration;
        this.metrics.total_attempts++;

        await this.save();
    }

    async recordSuccess(templateName) {
        if (this.metrics.templates[templateName]) {
            this.metrics.templates[templateName].success = true;
            this.metrics.successful_templates++;
        }
        await this.save();
    }

    async save() {
        try {
            await fs.writeFile(this.logPath, JSON.stringify(this.metrics, null, 2));
        } catch (error) {
            console.error(`Failed to save performance log: ${error.message}`);
        }
    }

    getSummary() {
        const sessionDuration = (Date.now() - this.sessionStart) / 1000 / 60; // minutes
        return {
            session_duration_minutes: Math.round(sessionDuration * 10) / 10,
            total_cost: `$${this.metrics.total_cost.toFixed(2)}`,
            total_attempts: this.metrics.total_attempts,
            successful_templates: `${this.metrics.successful_templates}/${Object.keys(this.metrics.templates).length}`,
            average_attempts_per_template: Math.round(this.metrics.total_attempts / Math.max(Object.keys(this.metrics.templates).length, 1) * 10) / 10
        };
    }
}

export default PerformanceTracker;
