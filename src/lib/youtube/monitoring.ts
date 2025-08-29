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

import { createBrowserClient } from '@/lib/supabase/browser-client';
import type { 
  Alert, 
  AlertRule, 
  AlertRuleType,
  AlertMetric,
  AlertCondition,
  AlertScope,
  SourceFolder, 
  YouTubeVideo 
} from '@/types';
import { snakeToCamelCase } from '@/types';
import { calculateMetrics } from './metrics';

const supabase = createBrowserClient();

/**
 * Channel Folder Management
 */
export class ChannelFolderManager {
  /**
   * Create a new source folder
   */
  async createFolder(
    folder: Omit<SourceFolder, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SourceFolder> {
    // Convert camelCase to snake_case for DB
    const dbFolder = {
      user_id: folder.user_id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
      is_active: true,
      channel_count: 0
    };
    
    const { data, error } = await supabase
      .from('source_folders')
      .insert(dbFolder)
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    // Convert snake_case to camelCase and add missing fields
    return {
      ...snakeToCamelCase(data),
      autoMonitor: false,
      monitorFrequencyHours: 24,
      channelCount: data.channel_count ?? 0,
      isMonitoringEnabled: data.is_active ?? false,
      checkIntervalHours: 24,
      lastCheckedAt: null,
      folderChannels: [],
      deleted_at: null
    } satisfies SourceFolder;
  }

  /**
   * Add channels to a folder
   */
  async addChannelsToFolder(folder_id: string, channel_ids: string[]): Promise<void> {
    const folder_channels = channel_ids.map((channel_id) => ({
      folder_id: folder_id,
      channel_id: channel_id,
    }));

    const { error } = await supabase.from('folder_channels').insert(folder_channels);

    if (error) {
      throw error;
    }
  }

  /**
   * Get all folders for a user
   */
  async getUserFolders(user_id: string): Promise<SourceFolder[]> {
    const { data, error } = await supabase
      .from('source_folders')
      .select(`
        *,
        folder_channels(
          channel_id,
          channels(*)
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    
    // Convert each folder from snake_case to camelCase and add missing fields
    return (data || []).map(folder => ({
      ...snakeToCamelCase(folder),
      autoMonitor: false,
      monitorFrequencyHours: 24,
      channelCount: folder.channel_count ?? 0,
      isMonitoringEnabled: folder.is_active ?? false,
      checkIntervalHours: 24,
      lastCheckedAt: null,
      folderChannels: folder.folder_channels?.map((fc: Record<string, unknown>) => snakeToCamelCase(fc)) || [],
      deleted_at: null
    } as unknown as SourceFolder));
  }

  /**
   * Update folder settings
   */
  async updateFolder(folder_id: string, updates: Partial<SourceFolder>): Promise<SourceFolder> {
    // Convert updates to snake_case for DB
    const dbUpdates = {
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.color !== undefined && { color: updates.color }),
      ...(updates.icon !== undefined && { icon: updates.icon }),
      ...(updates.isMonitoringEnabled !== undefined && { is_active: updates.isMonitoringEnabled }),
      ...(updates.channelCount !== undefined && { channel_count: updates.channelCount })
    };
    
    const { data, error } = await supabase
      .from('source_folders')
      .update(dbUpdates)
      .eq('id', folder_id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    // Convert response back to camelCase and add missing fields
    return {
      ...snakeToCamelCase(data),
      autoMonitor: false,
      monitorFrequencyHours: 24,
      channelCount: data.channel_count ?? 0,
      isMonitoringEnabled: data.is_active ?? false,
      checkIntervalHours: 24,
      lastCheckedAt: null,
      folderChannels: [],
      deleted_at: null
    } satisfies SourceFolder;
  }

  /**
   * Delete a folder
   */
  async deleteFolder(folder_id: string): Promise<void> {
    const { error } = await supabase.from('source_folders').delete().eq('id', folder_id);

    if (error) {
      throw error;
    }
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
    // Convert AlertRule to DB schema
    const dbRule = {
      user_id: rule.user_id,
      name: rule.name,
      description: rule.description,
      rule_type: rule.ruleType,
      metric: rule.metric,
      condition: rule.condition,
      threshold_value: rule.thresholdValue,
      target_type: rule.scope,
      target_id: rule.scopeId,
      is_active: rule.is_active,
      cooldown_minutes: rule.cooldownHours * 60
    };
    
    const { data, error } = await supabase
      .from('alert_rules')
      .insert(dbRule)
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    // Convert DB response to AlertRule type
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      ruleType: data.rule_type as AlertRuleType,
      metric: data.metric as AlertMetric,
      metricType: data.metric as AlertMetric,
      condition: data.condition as AlertCondition,
      comparisonOperator: '>',
      thresholdValue: data.threshold_value ?? 0,
      scope: data.target_type as AlertScope,
      scopeId: data.target_id,
      is_active: data.is_active ?? false,
      cooldownHours: Math.floor((data.cooldown_minutes ?? 0) / 60),
      lastTriggeredAt: data.last_triggered_at,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    } satisfies AlertRule;
  }

  /**
   * Get all rules for a user
   */
  async getUserRules(user_id: string): Promise<AlertRule[]> {
    const { data, error } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    
    // Convert DB response to AlertRule type
    return (data || []).map(rule => ({
      id: rule.id,
      user_id: rule.user_id,
      name: rule.name,
      description: rule.description,
      ruleType: rule.rule_type as AlertRuleType,
      metric: rule.metric as AlertMetric,
      metricType: rule.metric as AlertMetric,
      condition: rule.condition as AlertCondition,
      comparisonOperator: '>',
      thresholdValue: rule.threshold_value ?? 0,
      scope: rule.target_type as AlertScope,
      scopeId: rule.target_id,
      is_active: rule.is_active ?? false,
      cooldownHours: Math.floor((rule.cooldown_minutes ?? 0) / 60),
      lastTriggeredAt: rule.last_triggered_at,
      created_at: rule.created_at || new Date().toISOString(),
      updated_at: rule.updated_at || new Date().toISOString()
    } satisfies AlertRule));
  }

  /**
   * Check if a video triggers any alert rules
   */
  async checkVideoAgainstRules(video: YouTubeVideo, rules: AlertRule[]): Promise<Alert[]> {
    const alerts: Alert[] = [];
    // Calculate metrics for the video (modifies video in-place)
    calculateMetrics([video]);

    for (const rule of rules) {
      let triggered = false;
      let actual_value = 0;

      switch (rule.metricType) {
        case 'view_count':
          actual_value =
            typeof video.statistics?.view_count === 'number'
              ? video.statistics.view_count
              : Number.parseInt(String(video.statistics?.view_count || 0));
          triggered = this.compareValue(
            actual_value,
            rule.comparisonOperator || '>',
            rule.thresholdValue
          );
          break;

        case 'vph':
          if (video.metrics?.viewsPerHour !== undefined) {
            actual_value = video.metrics.viewsPerHour;
            triggered = this.compareValue(
              actual_value,
              rule.comparisonOperator || '>',
              rule.thresholdValue
            );
          }
          break;

        case 'engagementRate':
          if (video.metrics?.engagementRate !== undefined) {
            actual_value = video.metrics.engagementRate;
            triggered = this.compareValue(
              actual_value,
              rule.comparisonOperator || '>',
              rule.thresholdValue
            );
          }
          break;

        case 'viralScore':
          if (video.metrics?.viralScore !== undefined) {
            actual_value = video.metrics.viralScore;
            triggered = this.compareValue(
              actual_value,
              rule.comparisonOperator || '>',
              rule.thresholdValue
            );
          }
          break;

        case 'growthRate': {
          // Calculate growth rate from historical data
          const growth_rate = await this.calculateGrowthRate(video.id);
          if (growth_rate !== null) {
            actual_value = growth_rate;
            triggered = this.compareValue(
              actual_value,
              rule.comparisonOperator || '>',
              rule.thresholdValue
            );
          }
          break;
        }
      }

      if (triggered) {
        alerts.push({
          id: crypto.randomUUID(),
          rule_id: rule.id,
          user_id: rule.user_id,
          video_id: video.id,
          channel_id: video.snippet.channel_id,
          alertType: rule.ruleType,
          title: `${rule.name} Alert`,
          message: `Alert: ${video.snippet.title} - ${rule.metricType} is ${actual_value} (${rule.comparisonOperator || '>'} ${rule.thresholdValue})`,
          severity: 'warning' as const,
          metricValue: actual_value,
          triggeredAt: new Date().toISOString(),
          contextData: { video_title: video.snippet.title },
          is_read: false,
          readAt: null,
          isArchived: false,
          created_at: new Date().toISOString(),
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
  private async calculateGrowthRate(video_id: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('video_stats')
      .select('view_count, created_at')
      .eq('video_id', video_id)
      .order('created_at', { ascending: false })
      .limit(2);

    if (error || !data || data.length < 2) {
      return null;
    }

    const [recent, previous] = data;

    if (!recent || !previous || !recent.view_count || !previous.view_count || !recent.created_at || !previous.created_at) {
      return null;
    }

    const view_diff = recent.view_count - previous.view_count;
    const time_diff =
      new Date(recent.created_at).getTime() - new Date(previous.created_at).getTime();
    const hours_diff = time_diff / (1000 * 60 * 60);

    if (hours_diff === 0 || previous.view_count === 0) {
      return 0;
    }
    return ((view_diff / previous.view_count) * 100) / hours_diff; // Growth rate per hour as percentage
  }

  /**
   * Save alerts to database
   */
  async saveAlerts(alerts: Alert[]): Promise<void> {
    if (alerts.length === 0) {
      return;
    }

    // Map Alert type to database schema
    const alertsForDb = alerts.map(alert => ({
      rule_id: alert.rule_id,
      user_id: alert.user_id,
      entity_id: alert.video_id || alert.channel_id || null,
      entity_name: null,
      entity_type: alert.video_id ? 'video' : alert.channel_id ? 'channel' : null,
      alert_type: alert.alertType,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      metric_data: alert.contextData ? JSON.stringify(alert.contextData) : null,
      triggered_value: alert.metricValue || null,
      threshold_value: null,
      is_read: alert.is_read || false,
      created_at: alert.created_at || new Date().toISOString()
    }));

    const { error } = await supabase.from('alerts').insert(alertsForDb);

    if (error) {
      throw error;
    }
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
  async startMonitoring(user_id: string, interval_minutes = 60): Promise<void> {
    // Clear existing interval if any
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Run immediately
    await this.runMonitoringCheck(user_id);

    // Set up periodic checks
    this.intervalId = setInterval(
      async () => {
        await this.runMonitoringCheck(user_id);
      },
      interval_minutes * 60 * 1000
    );
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
  private async runMonitoringCheck(user_id: string): Promise<void> {
    try {
      console.log(`Running monitoring check for user ${user_id}`);

      // Get user's folders and rules
      const [folders, rules] = await Promise.all([
        this.folderManager.getUserFolders(user_id),
        this.ruleEngine.getUserRules(user_id),
      ]);

      if (rules.length === 0) {
        console.log('No active alert rules found');
        return;
      }

      // Collect all channel IDs from folders
      const channel_ids = new Set<string>();
      for (const folder of folders) {
        // Type-safe access to monitoring properties
        const folderWithMonitoring = folder as { 
          isMonitoringEnabled?: boolean; 
          folderChannels?: Array<{ channel_id: string; channels?: unknown }>;
          is_active?: boolean;
        };
        
        const isMonitoringEnabled = folderWithMonitoring.isMonitoringEnabled ?? folderWithMonitoring.is_active ?? false;
        const folderChannels = folderWithMonitoring.folderChannels ?? [];
        
        if (isMonitoringEnabled && folderChannels.length > 0) {
          folderChannels.forEach((fc) => {
            if (fc.channel_id) {
              channel_ids.add(fc.channel_id);
            }
          });
        }
      }

      if (channel_ids.size === 0) {
        console.log('No channels to monitor');
        return;
      }

      // Fetch recent videos from channels
      const videos = await this.fetchChannelVideos(Array.from(channel_ids));

      // Check each video against rules
      const all_alerts: Alert[] = [];
      for (const video of videos) {
        const alerts = await this.ruleEngine.checkVideoAgainstRules(video, rules);
        all_alerts.push(...alerts);
      }

      // Save alerts
      if (all_alerts.length > 0) {
        await this.ruleEngine.saveAlerts(all_alerts);
        console.log(`Generated ${all_alerts.length} alerts`);
      }

      // Update last check timestamp
      await this.updateLastCheckTime(user_id);
    } catch (error) {
      console.error('Failed to monitor channels:', error);
      throw error; // Re-throw for caller to handle
    }
  }

  /**
   * Fetch recent videos from channels
   */
  private async fetchChannelVideos(channel_ids: string[]): Promise<YouTubeVideo[]> {
    // This would typically call YouTube API
    // For now, returning empty array as YouTube API integration is separate
    console.log(`Would fetch videos from channels: ${channel_ids.join(', ')}`);
    return [];
  }

  /**
   * Update last monitoring check timestamp
   */
  private async updateLastCheckTime(user_id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', user_id);

    if (error) {
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
    const metric_value = alert.metricValue || 0;

    // Define severity based on metric value ranges
    // This is customizable based on requirements
    if (metric_value > 1000000) {
      return 'critical';
    }
    if (metric_value > 100000) {
      return 'high';
    }
    if (metric_value > 10000) {
      return 'medium';
    }
    return 'low';
  },

  /**
   * Check monitoring health
   */
  async checkMonitoringHealth(user_id: string): Promise<{
    isHealthy: boolean;
    lastCheck?: string;
    activeRules: number;
    monitoredChannels: number;
  }> {
    const [rules, folders] = await Promise.all([
      alertRuleEngine.getUserRules(user_id),
      channelFolderManager.getUserFolders(user_id),
    ]);

    const channel_count = folders.reduce((count, folder) => {
      // Type-safe access to monitoring properties
      const folderWithMonitoring = folder as {
        isMonitoringEnabled?: boolean;
        folderChannels?: Array<{ channel_id: string; channels?: unknown }>;
        is_active?: boolean;
      };
      
      const isMonitoringEnabled = folderWithMonitoring.isMonitoringEnabled ?? folderWithMonitoring.is_active ?? false;
      const folderChannels = folderWithMonitoring.folderChannels ?? [];
      
      if (isMonitoringEnabled && folderChannels.length > 0) {
        return count + folderChannels.length;
      }
      return count;
    }, 0);

    return {
      isHealthy: rules.length > 0 && channel_count > 0,
      activeRules: rules.length,
      monitoredChannels: channel_count,
    };
  },
};
