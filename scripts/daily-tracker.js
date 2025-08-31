#!/usr/bin/env node

// Daily Automated Quality Metrics Logger
// Runs quality tracking and generates alerts if needed

const { MetricsTracker } = require('./tracking-system');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const TRACKING_DIR = path.join(PROJECT_ROOT, 'tracking');
const ALERTS_FILE = path.join(TRACKING_DIR, 'alerts.log');

class DailyTracker {
  constructor() {
    this.tracker = new MetricsTracker();
    this.thresholds = {
      quality_score_critical: 20,
      quality_score_warning: 40,
      performance_score_critical: 30,
      performance_score_warning: 50,
      asset_scan_time_warning: 3000,
      asset_scan_time_critical: 5000,
      security_score_critical: 30,
      security_score_warning: 60,
      jscpd_duplicates_warning: 5,
      jscpd_duplicates_critical: 10
    };
  }

  /**
   * Run daily tracking with alerts
   */
  async runDailyTracking() {
    const startTime = Date.now();
    console.log(`🌅 Daily Quality Tracking Started - ${new Date().toLocaleString()}`);
    console.log('==========================================\n');

    try {
      // Collect metrics
      const metrics = await this.tracker.collectMetrics();
      
      // Save metrics
      await this.tracker.saveMetrics(metrics);
      
      // Check for alerts
      const alerts = this.checkAlerts(metrics);
      
      // Log alerts if any
      if (alerts.length > 0) {
        await this.logAlerts(alerts, metrics);
      }
      
      // Generate summary
      this.printDailySummary(metrics, alerts);
      
      // Auto-generate weekly report on Mondays
      if (new Date().getDay() === 1) { // Monday
        console.log('\n📅 Monday detected - generating weekly report...');
        await this.tracker.generateTrendReport(7);
      }
      
      const duration = Date.now() - startTime;
      console.log(`\n⏱️ Daily tracking completed in ${duration}ms`);
      
      return { metrics, alerts };
      
    } catch (error) {
      console.error('💥 Daily tracking failed:', error.message);
      await this.logError(error);
      throw error;
    }
  }

  /**
   * Check metrics against thresholds and generate alerts
   */
  checkAlerts(metrics) {
    const alerts = [];
    
    // Quality score alerts
    if (metrics.quality_score_overall <= this.thresholds.quality_score_critical) {
      alerts.push({
        level: 'critical',
        type: 'quality',
        message: `Overall quality score is critically low: ${metrics.quality_score_overall}%`,
        recommendation: 'Immediate attention needed for Modern React and Security scores'
      });
    } else if (metrics.quality_score_overall <= this.thresholds.quality_score_warning) {
      alerts.push({
        level: 'warning',
        type: 'quality',
        message: `Overall quality score is below target: ${metrics.quality_score_overall}%`,
        recommendation: 'Focus on improving component architecture and security'
      });
    }
    
    // Performance alerts
    if (metrics.performance_score <= this.thresholds.performance_score_critical) {
      alerts.push({
        level: 'critical',
        type: 'performance',
        message: `Performance score is critically low: ${metrics.performance_score}%`,
        recommendation: 'Optimize asset scanning and verification processes immediately'
      });
    } else if (metrics.performance_score <= this.thresholds.performance_score_warning) {
      alerts.push({
        level: 'warning',
        type: 'performance', 
        message: `Performance score needs attention: ${metrics.performance_score}%`,
        recommendation: 'Consider caching and parallel processing optimizations'
      });
    }
    
    // Asset scan time alerts
    if (metrics.asset_scan_time >= this.thresholds.asset_scan_time_critical) {
      alerts.push({
        level: 'critical',
        type: 'scan_time',
        message: `Asset scan time is too slow: ${metrics.asset_scan_time}ms`,
        recommendation: 'Implement caching and incremental scanning immediately'
      });
    } else if (metrics.asset_scan_time >= this.thresholds.asset_scan_time_warning) {
      alerts.push({
        level: 'warning',
        type: 'scan_time',
        message: `Asset scan time is slower than optimal: ${metrics.asset_scan_time}ms`,
        recommendation: 'Consider performance optimizations'
      });
    }
    
    // Security score alerts
    if (metrics.security_score <= this.thresholds.security_score_critical) {
      alerts.push({
        level: 'critical',
        type: 'security',
        message: `Security score is critically low: ${metrics.security_score}%`,
        recommendation: 'Add authentication to unprotected API routes immediately'
      });
    } else if (metrics.security_score <= this.thresholds.security_score_warning) {
      alerts.push({
        level: 'warning',
        type: 'security',
        message: `Security score needs improvement: ${metrics.security_score}%`,
        recommendation: 'Review and secure API endpoints'
      });
    }
    
    // Code duplication alerts
    if (metrics.jscpd_duplicates >= this.thresholds.jscpd_duplicates_critical) {
      alerts.push({
        level: 'critical',
        type: 'duplication',
        message: `Code duplication is too high: ${metrics.jscpd_duplicates}%`,
        recommendation: 'Refactor duplicate code patterns immediately'
      });
    } else if (metrics.jscpd_duplicates >= this.thresholds.jscpd_duplicates_warning) {
      alerts.push({
        level: 'warning',
        type: 'duplication',
        message: `Code duplication is above threshold: ${metrics.jscpd_duplicates}%`,
        recommendation: 'Review and refactor common patterns'
      });
    }
    
    return alerts;
  }

  /**
   * Print daily summary
   */
  printDailySummary(metrics, alerts) {
    console.log('\n📊 DAILY METRICS SUMMARY');
    console.log('========================');
    
    console.log(`📅 Date: ${metrics.date}`);
    console.log(`⏰ Time: ${new Date(metrics.timestamp).toLocaleTimeString()}`);
    
    console.log('\n🎯 Key Metrics:');
    console.log(`  Overall Quality: ${metrics.quality_score_overall}% ${this.getScoreEmoji(metrics.quality_score_overall, 40)}`);
    console.log(`  Performance Score: ${metrics.performance_score}% ${this.getScoreEmoji(metrics.performance_score, 50)}`);
    console.log(`  Security Score: ${metrics.security_score}% ${this.getScoreEmoji(metrics.security_score, 60)}`);
    console.log(`  Modern React: ${metrics.modern_react_score}% ${this.getScoreEmoji(metrics.modern_react_score, 50)}`);
    
    console.log('\n⚡ Performance:');
    console.log(`  Asset Scan Time: ${metrics.asset_scan_time}ms ${metrics.asset_scan_time < 1000 ? '✅' : metrics.asset_scan_time < 3000 ? '⚠️' : '❌'}`);
    console.log(`  Context Load Time: ${metrics.context_load_time}ms ${metrics.context_load_time < 10000 ? '✅' : metrics.context_load_time < 30000 ? '⚠️' : '❌'}`);
    console.log(`  Verify Time: ${metrics.verify_time}ms ${metrics.verify_time < 5000 ? '✅' : metrics.verify_time < 10000 ? '⚠️' : '❌'}`);
    
    console.log('\n📈 Assets:');
    console.log(`  Total Assets: ${metrics.total_assets}`);
    console.log(`  Components: ${metrics.components_count} (${metrics.api_routes_count} APIs, ${metrics.tables_count} Tables)`);
    console.log(`  Code Duplication: ${metrics.jscpd_duplicates}% ${metrics.jscpd_duplicates < 3 ? '✅' : metrics.jscpd_duplicates < 5 ? '⚠️' : '❌'}`);
    
    // Alerts section
    if (alerts.length > 0) {
      console.log('\n🚨 ALERTS:');
      alerts.forEach((alert, index) => {
        const icon = alert.level === 'critical' ? '🔴' : '🟡';
        console.log(`  ${icon} ${alert.message}`);
        console.log(`     💡 ${alert.recommendation}`);
      });
    } else {
      console.log('\n✅ No alerts - all metrics within acceptable ranges!');
    }
  }

  /**
   * Get score emoji based on value and threshold
   */
  getScoreEmoji(score, threshold) {
    if (score >= threshold + 20) return '🟢';
    if (score >= threshold) return '🟡';
    return '🔴';
  }

  /**
   * Log alerts to file
   */
  async logAlerts(alerts, metrics) {
    const alertEntry = {
      timestamp: metrics.timestamp,
      date: metrics.date,
      alerts: alerts,
      metrics_summary: {
        quality_score: metrics.quality_score_overall,
        performance_score: metrics.performance_score,
        security_score: metrics.security_score
      }
    };
    
    const logLine = JSON.stringify(alertEntry) + '\n';
    fs.appendFileSync(ALERTS_FILE, logLine);
    
    console.log(`🚨 ${alerts.length} alert(s) logged to: ${ALERTS_FILE}`);
  }

  /**
   * Log error to file
   */
  async logError(error) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    
    const logLine = JSON.stringify(errorEntry) + '\n';
    fs.appendFileSync(ALERTS_FILE, logLine);
  }

  /**
   * Run continuous monitoring mode
   */
  async runContinuous(intervalHours = 24) {
    console.log(`🔄 Starting continuous daily tracking (every ${intervalHours} hours)`);
    console.log('📊 Press Ctrl+C to stop\n');

    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    // Run initial tracking
    await this.runDailyTracking();
    
    // Set up periodic tracking
    const intervalId = setInterval(async () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`⏰ Scheduled daily tracking at ${new Date().toLocaleString()}`);
      try {
        await this.runDailyTracking();
      } catch (error) {
        console.error('💥 Scheduled tracking failed:', error.message);
      }
    }, intervalMs);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping continuous tracking...');
      clearInterval(intervalId);
      process.exit(0);
    });
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const tracker = new DailyTracker();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🌅 Daily Quality Metrics Tracker

Usage:
  node scripts/daily-tracker.js [options]

Options:
  --continuous [hours]  Run continuous tracking (default: 24 hours)
  --quiet              Minimal output
  --help, -h           Show this help

Examples:
  node scripts/daily-tracker.js
  node scripts/daily-tracker.js --continuous
  node scripts/daily-tracker.js --continuous 12
`);
    return;
  }

  const continuousIndex = args.indexOf('--continuous');
  if (continuousIndex !== -1) {
    const intervalHours = parseInt(args[continuousIndex + 1]) || 24;
    await tracker.runContinuous(intervalHours);
    return;
  }

  // Default: run single daily tracking
  await tracker.runDailyTracking();
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled promise rejection:', error);
  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DailyTracker };