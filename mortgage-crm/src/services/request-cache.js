import crypto from 'crypto';

/**
 * Request Cache Service
 *
 * Prevents duplicate generations by caching results based on prompt hashes.
 * Saves costs by reusing previous generations for identical requests.
 *
 * Features:
 * - Hash-based caching
 * - TTL expiration
 * - Hit count tracking
 * - Cost savings calculation
 * - Database + Memory dual storage
 */

class RequestCache {
  constructor(supabase = null) {
    this.supabase = supabase;
    this.localCache = new Map(); // Memory cache for fast lookups
    this.defaultTTL = 24 * 60 * 60 * 1000; // 24 hours
    this.stats = {
      hits: 0,
      misses: 0,
      costSaved: 0
    };
  }

  /**
   * Generate hash from request parameters
   */
  generateHash(request) {
    // Normalize request to ensure consistent hashing
    const normalized = {
      type: request.type,
      message: request.message?.toLowerCase().trim(),
      loanOfficer: {
        name: request.loanOfficer?.name,
        nmls: request.loanOfficer?.nmls
      },
      preferences: {
        style: request.preferences?.style,
        fastMode: request.preferences?.fastMode
      }
    };

    const str = JSON.stringify(normalized);
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Check if request is in cache
   */
  async get(request) {
    const hash = this.generateHash(request);

    // Check memory cache first
    if (this.localCache.has(hash)) {
      const cached = this.localCache.get(hash);

      // Check if expired
      if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
        this.localCache.delete(hash);
        await this.deleteFromDatabase(hash);
        this.stats.misses++;
        return null;
      }

      // Update hit count
      cached.hitCount++;
      this.stats.hits++;
      this.stats.costSaved += cached.costSaved || 0;

      console.log(`💾 Cache HIT: ${hash.substring(0, 12)}... (hit #${cached.hitCount})`);

      // Update hit count in database if available
      if (this.supabase) {
        await this.updateHitCount(hash, cached.hitCount);
      }

      return cached;
    }

    // Check database if available
    if (this.supabase) {
      const dbResult = await this.getFromDatabase(hash);
      if (dbResult) {
        // Populate local cache
        this.localCache.set(hash, dbResult);
        this.stats.hits++;
        this.stats.costSaved += dbResult.costSaved || 0;
        console.log(`💾 Cache HIT (from DB): ${hash.substring(0, 12)}...`);
        return dbResult;
      }
    }

    this.stats.misses++;
    console.log(`🔍 Cache MISS: ${hash.substring(0, 12)}...`);
    return null;
  }

  /**
   * Store result in cache
   */
  async set(request, result, ttl = this.defaultTTL) {
    const hash = this.generateHash(request);
    const expiresAt = new Date(Date.now() + ttl);

    const cacheEntry = {
      hash,
      prompt: JSON.stringify(request),
      model: result.model,
      outputUrl: result.output || result.url,
      qualityScore: result.validation?.overall || null,
      hitCount: 1,
      costSaved: 0,
      expiresAt,
      createdAt: new Date(),
      lastAccessedAt: new Date()
    };

    // Store in memory
    this.localCache.set(hash, cacheEntry);

    // Store in database if available
    if (this.supabase) {
      await this.saveToDatabase(cacheEntry);
    }

    console.log(`✅ Cached: ${hash.substring(0, 12)}... (expires: ${expiresAt.toISOString()})`);

    return cacheEntry;
  }

  /**
   * Get from database
   */
  async getFromDatabase(hash) {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('request_cache')
        .select('*')
        .eq('prompt_hash', hash)
        .single();

      if (error || !data) return null;

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await this.deleteFromDatabase(hash);
        return null;
      }

      // Update last accessed time
      await this.supabase
        .from('request_cache')
        .update({
          last_accessed_at: new Date().toISOString(),
          hit_count: data.hit_count + 1
        })
        .eq('prompt_hash', hash);

      return {
        hash: data.prompt_hash,
        prompt: data.prompt,
        model: data.model,
        outputUrl: data.output_url,
        qualityScore: data.quality_score,
        hitCount: data.hit_count + 1,
        costSaved: parseFloat(data.cost_saved_usd || 0),
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        lastAccessedAt: new Date()
      };

    } catch (error) {
      console.error('Cache database read error:', error);
      return null;
    }
  }

  /**
   * Save to database
   */
  async saveToDatabase(entry) {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('request_cache')
        .upsert({
          prompt_hash: entry.hash,
          prompt: entry.prompt,
          model: entry.model,
          output_url: entry.outputUrl,
          quality_score: entry.qualityScore,
          hit_count: entry.hitCount,
          cost_saved_usd: entry.costSaved,
          expires_at: entry.expiresAt.toISOString(),
          created_at: entry.createdAt.toISOString(),
          last_accessed_at: entry.lastAccessedAt.toISOString()
        }, {
          onConflict: 'prompt_hash'
        });

      if (error) {
        console.error('Cache database write error:', error);
      }

    } catch (error) {
      console.error('Cache database write error:', error);
    }
  }

  /**
   * Update hit count in database
   */
  async updateHitCount(hash, count) {
    if (!this.supabase) return;

    try {
      await this.supabase
        .from('request_cache')
        .update({
          hit_count: count,
          last_accessed_at: new Date().toISOString()
        })
        .eq('prompt_hash', hash);
    } catch (error) {
      console.error('Cache hit count update error:', error);
    }
  }

  /**
   * Delete from database
   */
  async deleteFromDatabase(hash) {
    if (!this.supabase) return;

    try {
      await this.supabase
        .from('request_cache')
        .delete()
        .eq('prompt_hash', hash);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear expired entries
   */
  async clearExpired() {
    let clearedCount = 0;

    // Clear from memory
    for (const [hash, entry] of this.localCache.entries()) {
      if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
        this.localCache.delete(hash);
        clearedCount++;
      }
    }

    // Clear from database
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('request_cache')
          .delete()
          .lt('expires_at', new Date().toISOString())
          .select();

        if (!error && data) {
          clearedCount += data.length;
        }
      } catch (error) {
        console.error('Cache cleanup error:', error);
      }
    }

    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} expired cache entries`);
    }

    return clearedCount;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0
      ? ((this.stats.hits / totalRequests) * 100).toFixed(1)
      : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      total: totalRequests,
      hitRate: `${hitRate}%`,
      costSaved: this.stats.costSaved.toFixed(2),
      cacheSize: this.localCache.size
    };
  }

  /**
   * Clear all cache (memory + database)
   */
  async clearAll() {
    // Clear memory
    const memorySize = this.localCache.size;
    this.localCache.clear();

    // Clear database
    let dbCount = 0;
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('request_cache')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000')
          .select();

        if (!error && data) {
          dbCount = data.length;
        }
      } catch (error) {
        console.error('Cache clear error:', error);
      }
    }

    console.log(`🧹 Cleared ${memorySize} memory entries and ${dbCount} database entries`);

    return { memory: memorySize, database: dbCount };
  }

  /**
   * Invalidate specific cache entry
   */
  async invalidate(request) {
    const hash = this.generateHash(request);

    // Remove from memory
    this.localCache.delete(hash);

    // Remove from database
    await this.deleteFromDatabase(hash);

    console.log(`🗑️  Invalidated cache: ${hash.substring(0, 12)}...`);

    return true;
  }

  /**
   * Update cost savings for a cache hit
   */
  updateCostSavings(hash, costSaved) {
    if (this.localCache.has(hash)) {
      const entry = this.localCache.get(hash);
      entry.costSaved = (entry.costSaved || 0) + costSaved;
      this.localCache.set(hash, entry);
    }

    // Update in database
    if (this.supabase) {
      this.supabase
        .from('request_cache')
        .update({
          cost_saved_usd: costSaved
        })
        .eq('prompt_hash', hash)
        .then(() => {})
        .catch(error => {
          console.error('Cost savings update error:', error);
        });
    }
  }
}

export default RequestCache;
