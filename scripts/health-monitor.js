#!/usr/bin/env node
// Health Check Monitor Script for Dhacle
// Monitors system health and provides CLI interface

require('dotenv').config({ path: '.env.local' });
const http = require('http');
const https = require('https');

const CONFIG = {
  HOST: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007',
  TIMEOUT: 10000, // 10 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY: 2000, // 2 seconds
};

class HealthMonitor {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout after ${CONFIG.TIMEOUT}ms`));
      }, CONFIG.TIMEOUT);

      const req = client.get(url, options, (res) => {
        clearTimeout(timeoutId);
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (error) {
            resolve({ statusCode: res.statusCode, data: { raw: data } });
          }
        });
      });

      req.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  async runHealthCheck(retryCount = 0) {
    const url = `${CONFIG.HOST}/api/health?fresh=true`;
    
    try {
      console.log(`🏥 Running health check: ${url}`);
      const startTime = Date.now();
      
      const { statusCode, data } = await this.makeRequest(url);
      const duration = Date.now() - startTime;

      const result = {
        success: statusCode === 200,
        statusCode,
        duration,
        data,
        timestamp: new Date().toISOString(),
        attempt: retryCount + 1,
      };

      if (result.success) {
        this.printHealthReport(data, duration);
      } else {
        console.log(`❌ Health check failed (${statusCode}) in ${duration}ms`);
        if (data.error) console.log(`   Error: ${data.error}`);
      }

      return result;
    } catch (error) {
      console.log(`💥 Health check request failed: ${error.message}`);
      
      if (retryCount < CONFIG.RETRY_COUNT - 1) {
        console.log(`🔄 Retrying in ${CONFIG.RETRY_DELAY}ms... (${retryCount + 1}/${CONFIG.RETRY_COUNT})`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return this.runHealthCheck(retryCount + 1);
      }

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        attempt: retryCount + 1,
      };
    }
  }

  async runSpecificCheck(checkName) {
    const url = `${CONFIG.HOST}/api/health?check=${checkName}&fresh=true`;
    
    try {
      console.log(`🔍 Running specific check: ${checkName}`);
      const { statusCode, data } = await this.makeRequest(url);
      
      if (statusCode === 404) {
        console.log(`❌ Check '${checkName}' not found`);
        if (data.available_checks) {
          console.log(`📋 Available checks: ${data.available_checks.join(', ')}`);
        }
        return;
      }

      this.printCheckResult(data);
    } catch (error) {
      console.log(`💥 Specific check failed: ${error.message}`);
    }
  }

  printHealthReport(data, duration) {
    const { overall_status, checks, summary, execution_time } = data;
    
    console.log(`\n🏥 Health Check Report`);
    console.log(`======================`);
    console.log(`Overall Status: ${this.getStatusIcon(overall_status)} ${overall_status.toUpperCase()}`);
    console.log(`Request Time: ${duration}ms`);
    console.log(`Execution Time: ${execution_time}ms`);
    console.log(`Timestamp: ${data.timestamp}`);
    
    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Healthy: ${summary.healthy}`);
    console.log(`  ⚠️  Warning: ${summary.warning}`);
    console.log(`  ❌ Unhealthy: ${summary.unhealthy}`);
    console.log(`  📋 Total: ${summary.total}`);

    console.log(`\n🔍 Individual Checks:`);
    checks.forEach(check => {
      const icon = this.getStatusIcon(check.status);
      const duration = check.duration ? ` (${Math.round(check.duration)}ms)` : '';
      console.log(`  ${icon} ${check.name}: ${check.message}${duration}`);
      
      if (check.meta && Object.keys(check.meta).length > 0) {
        const meta = JSON.stringify(check.meta, null, 0);
        if (meta.length < 100) {
          console.log(`    Meta: ${meta}`);
        }
      }
    });

    // Alert if unhealthy
    if (overall_status === 'unhealthy') {
      console.log(`\n🚨 ALERT: System has unhealthy components!`);
      const unhealthyChecks = checks.filter(c => c.status === 'unhealthy');
      console.log(`   Failed checks: ${unhealthyChecks.map(c => c.name).join(', ')}`);
    }
  }

  printCheckResult(check) {
    const icon = this.getStatusIcon(check.status);
    console.log(`\n${icon} ${check.name}: ${check.status.toUpperCase()}`);
    console.log(`Message: ${check.message}`);
    console.log(`Timestamp: ${check.timestamp}`);
    
    if (check.duration) {
      console.log(`Duration: ${Math.round(check.duration)}ms`);
    }
    
    if (check.meta && Object.keys(check.meta).length > 0) {
      console.log(`Meta: ${JSON.stringify(check.meta, null, 2)}`);
    }
  }

  getStatusIcon(status) {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '❓';
    }
  }

  async runContinuousMonitoring(intervalMinutes = 5) {
    console.log(`🔄 Starting continuous monitoring (every ${intervalMinutes} minutes)`);
    console.log(`📊 Press Ctrl+C to stop\n`);

    const interval = intervalMinutes * 60 * 1000;
    
    // Run initial check
    await this.runHealthCheck();

    // Set up periodic checks
    const intervalId = setInterval(async () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`⏰ Scheduled health check at ${new Date().toLocaleString()}`);
      await this.runHealthCheck();
    }, interval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(`\n👋 Stopping continuous monitoring...`);
      clearInterval(intervalId);
      process.exit(0);
    });
  }

  async listChecks() {
    const url = `${CONFIG.HOST}/api/health?check=invalid`;
    
    try {
      const { statusCode, data } = await this.makeRequest(url);
      
      if (statusCode === 404 && data.available_checks) {
        console.log(`📋 Available Health Checks:`);
        data.available_checks.forEach((check, index) => {
          console.log(`  ${index + 1}. ${check}`);
        });
        console.log(`\n💡 Usage: node scripts/health-monitor.js --check <name>`);
      }
    } catch (error) {
      console.log(`💥 Failed to list checks: ${error.message}`);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const monitor = new HealthMonitor();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🏥 Dhacle Health Monitor

Usage:
  node scripts/health-monitor.js [options]

Options:
  --check <name>     Run specific health check
  --monitor [mins]   Run continuous monitoring (default: 5 minutes)
  --list            List available health checks  
  --simple          Simple format output
  --help, -h        Show this help

Examples:
  node scripts/health-monitor.js
  node scripts/health-monitor.js --check database
  node scripts/health-monitor.js --monitor 10
  node scripts/health-monitor.js --list
`);
    return;
  }

  if (args.includes('--list')) {
    await monitor.listChecks();
    return;
  }

  const checkIndex = args.indexOf('--check');
  if (checkIndex !== -1 && args[checkIndex + 1]) {
    await monitor.runSpecificCheck(args[checkIndex + 1]);
    return;
  }

  const monitorIndex = args.indexOf('--monitor');
  if (monitorIndex !== -1) {
    const intervalMinutes = parseInt(args[monitorIndex + 1]) || 5;
    await monitor.runContinuousMonitoring(intervalMinutes);
    return;
  }

  // Default: run single health check
  await monitor.runHealthCheck();
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled promise rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { HealthMonitor };