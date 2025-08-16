/**
 * YouTube Channel Monitoring System
 * Phase 3: Core Features Implementation
 * 
 * Features:
 * - Channel folder management
 * - Periodic monitoring checks
 * - Alert rule engine
 * - Metric threshold detection
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { YouTubeVideo, YouTubeChannel, AlertRule, SourceFolder, Alert } from '@/types/youtube-lens';
import { calculateMetrics } from './metrics';
import { getPopularShortsWithoutKeyword } from './popular-shorts';

const supabase = createClientComponentClient();

/**
 * Channel Folder Management
 */
export class ChannelFolderManager {
  /**
   * Create a new source folder
   */
  async createFolder(folder: Omit<SourceFolder, 'id' | 'created_at' | 'updated_at'>): Promise<SourceFolder> {
    const { data, error } = await supabase
      .from('source_folders')
      .insert(folder)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add channels to a folder
   */
  async addChannelsToFolder(folderId: string, channelIds: string[]): Promise<void> {
    const folderChannels = channelIds.map(channelId => ({
      folder_id: folderId,
      channel_id: channelId
    }));

    const { error } = await supabase
      .from('folder_channels')
      .insert(folderChannels);

    if (error) throw error;
  }

  /**
   * Get all folders for a user
   */
  async getUserFolders(userId: string): Promise<SourceFolder[]> {
    const { data, error } = await supabase
      .from('source_folders')
      .select(`
        *,
        folder_channels(
          channel_id,
          channels(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update folder settings
   */
  async updateFolder(folderId: string, updates: Partial<SourceFolder>): Promise<SourceFolder> {
    const { data, error } = await supabase
      .from('source_folders')
      .update(updates)
      .eq('id', folderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a folder
   */
  async deleteFolder(folderId: string): Promise<void> {
    const { error } = await supabase
      .from('source_folders')
      .delete()
      .eq('id', folderId);

    if (error) throw error;
  }
}

/**
 * Alert Rule Engine
 */
export class AlertRuleEngine {
  /**
   * Create a new alert rule
   */
  async createRule(rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>): Promise<AlertRule> {
    const { data, error } = await supabase
      .from('alert_rules')
      .insert(rule)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all rules for a user
   */
  async getUserRules(userId: string): Promise<AlertRule[]> {
    const { data, error } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Check if a video triggers any alert rules
   */
  async checkVideoAgainstRules(video: YouTubeVideo, rules: AlertRule[]): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const metrics = calculateMetrics([video])[0];

    for (const rule of rules) {
      let triggered = false;
      let actualValue = 0;

      switch (rule.metric_type) {
        case 'view_count':
          actualValue = video.statistics.viewCount;
          triggered = this.compareValue(actualValue, rule.comparison_operator || '>', rule.threshold_value);
          break;

        case 'vph':
          if (video.metrics?.vph !== undefined) {
            actualValue = video.metrics.vph;
            triggered = this.compareValue(actualValue, rule.comparison_operator || '>', rule.threshold_value);
          }
          break;

        case 'engagement_rate':
          if (video.metrics?.engagement_rate !== undefined) {
            actualValue = video.metrics.engagement_rate;
            triggered = this.compareValue(actualValue, rule.comparison_operator || '>', rule.threshold_value);
          }
          break;

        case 'viral_score':
          if (video.metrics?.viral_score !== undefined) {
            actualValue = video.metrics.viral_score;
            triggered = this.compareValue(actualValue, rule.comparison_operator || '>', rule.threshold_value);
          }
          break;

        case 'growth_rate':
          // Calculate growth rate from historical data
          const growthRate = await this.calculateGrowthRate(video.id);
          if (growthRate !== null) {
            actualValue = growthRate;
            triggered = this.compareValue(actualValue, rule.comparison_operator || '>', rule.threshold_value);
          }
          break;
      }

      if (triggered) {
        alerts.push({
          id: crypto.randomUUID(),
          rule_id: rule.id,
          user_id: rule.user_id,
          video_id: video.id,
          channel_id: video.snippet.channelId,
          alert_type: rule.rule_type,
          title: `${rule.name} Alert`,
          message: `Alert: ${video.snippet.title} - ${rule.metric_type} is ${actualValue} (${rule.comparison_operator || '>'} ${rule.threshold_value})`,
          severity: 'warning' as const,
          metric_value: actualValue,
          triggered_at: new Date().toISOString(),
          context_data: { video_title: video.snippet.title },
          is_read: false,
          read_at: null,
          is_archived: false,
          created_at: new Date().toISOString()
        });
      }
    }

    return alerts;
  }

  /**
   * Compare values based on operator
   */
  private compareValue(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>':
        return value > threshold;
      case '>=':
        return value >= threshold;
      case '<':
        return value < threshold;
      case '<=':
        return value <= threshold;
      case '=':
        return value === threshold;
      case '!=':
        return value !== threshold;
      default:
        return false;
    }
  }

  /**
   * Calculate growth rate from historical stats
   */
  private async calculateGrowthRate(videoId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('video_stats')
      .select('view_count, snapshot_at')
      .eq('video_id', videoId)
      .order('snapshot_at', { ascending: false })
      .limit(2);

    if (error || !data || data.length < 2) return null;

    const [recent, previous] = data;
    const viewDiff = recent.view_count - previous.view_count;
    const timeDiff = new Date(recent.snapshot_at).getTime() - new Date(previous.snapshot_at).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff === 0) return 0;
    return (viewDiff / previous.view_count) * 100 / hoursDiff; // Growth rate per hour as percentage
  }

  /**
   * Save alerts to database
   */
  async saveAlerts(alerts: Alert[]): Promise<void> {
    if (alerts.length === 0) return;

    const { error } = await supabase
      .from('alerts')
      .insert(alerts);

    if (error) throw error;
  }
}

/**
 * Monitoring Scheduler
 */
export class MonitoringScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private folderManager = new ChannelFolderManager();
  private ruleEngine = new AlertRuleEngine();

  /**
   * Start monitoring for a user
   */
  async startMonitoring(userId: string, intervalMinutes: number = 60): Promise<void> {
    // Clear existing interval if any
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Run immediately
    await this.runMonitoringCheck(userId);

    // Set up periodic checks
    this.intervalId = setInterval(async () => {
      await this.runMonitoringCheck(userId);
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Run a single monitoring check
   */
  private async runMonitoringCheck(userId: string): Promise<void> {
    try {
      console.log(`Running monitoring check for user ${userId}`);

      // Get user's folders and rules
      const [folders, rules] = await Promise.all([
        this.folderManager.getUserFolders(userId),
        this.ruleEngine.getUserRules(userId)
      ]);

      if (rules.length === 0) {
        console.log('No active alert rules found');
        return;
      }

      // Collect all channel IDs from folders
      const channelIds = new Set<string>();
      for (const folder of folders) {
        if (folder.is_monitoring_enabled && folder.folder_channels) {
          folder.folder_channels.forEach((fc: any) => {
            channelIds.add(fc.channel_id);
          });
        }
      }

      if (channelIds.size === 0) {
        console.log('No channels to monitor');
        return;
      }

      // Fetch recent videos from channels
      const videos = await this.fetchChannelVideos(Array.from(channelIds));
      
      // Check each video against rules
      const allAlerts: Alert[] = [];
      for (const video of videos) {
        const alerts = await this.ruleEngine.checkVideoAgainstRules(video, rules);
        allAlerts.push(...alerts);
      }

      // Save alerts
      if (allAlerts.length > 0) {
        await this.ruleEngine.saveAlerts(allAlerts);
        console.log(`Generated ${allAlerts.length} alerts`);
      }

      // Update last check timestamp
      await this.updateLastCheckTime(userId);

    } catch (error) {
      console.error('Monitoring check failed:', error);
    }
  }

  /**
   * Fetch recent videos from channels
   */
  private async fetchChannelVideos(channelIds: string[]): Promise<YouTubeVideo[]> {
    // This would typically call YouTube API
    // For now, returning empty array as YouTube API integration is separate
    console.log(`Would fetch videos from channels: ${channelIds.join(', ')}`);
    return [];
  }

  /**
   * Update last monitoring check timestamp
   */
  private async updateLastCheckTime(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        last_monitoring_check: new Date().toISOString() 
      })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update last check time:', error);
    }
  }
}

/**
 * Export singleton instances
 */
export const channelFolderManager = new ChannelFolderManager();
export const alertRuleEngine = new AlertRuleEngine();
export const monitoringScheduler = new MonitoringScheduler();

/**
 * Monitoring utilities
 */
export const monitoringUtils = {
  /**
   * Format alert message
   */
  formatAlertMessage(alert: Alert): string {
    return alert.message || 'Alert triggered';
  },

  /**
   * Get alert severity
   */
  getAlertSeverity(alert: Alert): 'low' | 'medium' | 'high' | 'critical' {
    const metricValue = alert.metric_value || 0;
    
    // Define severity based on metric value ranges
    // This is customizable based on requirements
    if (metricValue > 1000000) return 'critical';
    if (metricValue > 100000) return 'high';
    if (metricValue > 10000) return 'medium';
    return 'low';
  },

  /**
   * Check monitoring health
   */
  async checkMonitoringHealth(userId: string): Promise<{
    isHealthy: boolean;
    lastCheck?: string;
    activeRules: number;
    monitoredChannels: number;
  }> {
    const [rules, folders] = await Promise.all([
      alertRuleEngine.getUserRules(userId),
      channelFolderManager.getUserFolders(userId)
    ]);

    const channelCount = folders.reduce((count, folder) => {
      if (folder.is_monitoring_enabled && folder.folder_channels) {
        return count + folder.folder_channels.length;
      }
      return count;
    }, 0);

    return {
      isHealthy: rules.length > 0 && channelCount > 0,
      activeRules: rules.length,
      monitoredChannels: channelCount
    };
  }
};