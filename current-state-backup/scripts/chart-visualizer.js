#!/usr/bin/env node

// Simple Chart Visualization Tool for Quality Metrics
// Generates ASCII charts and HTML visualizations

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const TRACKING_DIR = path.join(PROJECT_ROOT, 'tracking');
const METRICS_FILE = path.join(TRACKING_DIR, 'metrics-history.csv');
const CHARTS_DIR = path.join(TRACKING_DIR, 'charts');

class ChartVisualizer {
  constructor() {
    if (!fs.existsSync(CHARTS_DIR)) {
      fs.mkdirSync(CHARTS_DIR, { recursive: true });
    }
  }

  /**
   * Load metrics data from CSV
   */
  loadMetricsData(days = 30) {
    if (!fs.existsSync(METRICS_FILE)) {
      throw new Error('No metrics data found. Run tracking first.');
    }

    const csvContent = fs.readFileSync(METRICS_FILE, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('Insufficient data for visualization.');
    }

    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, index) => {
        const value = values[index];
        row[header] = isNaN(value) ? value : parseFloat(value);
      });
      return row;
    });

    // Filter last N days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return data.filter(row => new Date(row.date) >= cutoffDate);
  }

  /**
   * Generate ASCII line chart
   */
  generateASCIIChart(data, metric, title, width = 60, height = 15) {
    if (data.length === 0) return 'No data available';
    
    const values = data.map(row => row[metric]).filter(val => !isNaN(val));
    if (values.length === 0) return 'No valid data for metric';
    
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    
    const chart = [];
    chart.push(`📈 ${title}`);
    chart.push('═'.repeat(width));
    
    // Create chart grid
    for (let row = height - 1; row >= 0; row--) {
      let line = '';
      const threshold = minVal + (range * row) / (height - 1);
      
      // Y-axis label
      const label = threshold.toFixed(1).padStart(6);
      line += label + ' │';
      
      // Plot points
      for (let col = 0; col < Math.min(width - 8, values.length); col++) {
        const value = values[col];
        const scaledValue = ((value - minVal) / range) * (height - 1);
        
        if (Math.abs(scaledValue - row) < 0.5) {
          line += '●';
        } else if (col < values.length - 1) {
          // Draw line between points
          const nextValue = values[col + 1];
          const nextScaled = ((nextValue - minVal) / range) * (height - 1);
          const lineStart = Math.min(scaledValue, nextScaled);
          const lineEnd = Math.max(scaledValue, nextScaled);
          
          if (row >= lineStart && row <= lineEnd) {
            line += row === Math.round(scaledValue) ? '●' : '│';
          } else {
            line += ' ';
          }
        } else {
          line += ' ';
        }
      }
      
      chart.push(line);
    }
    
    // X-axis
    chart.push(' '.repeat(7) + '└' + '─'.repeat(Math.min(width - 8, values.length)));
    
    // Add recent values
    const recentValues = values.slice(-5);
    chart.push(`📊 Recent: ${recentValues.map(v => v.toFixed(1)).join(' → ')}`);
    chart.push(`📈 Range: ${minVal.toFixed(1)} - ${maxVal.toFixed(1)}`);
    
    return chart.join('\n');
  }

  /**
   * Generate ASCII bar chart for latest metrics
   */
  generateASCIIBarChart(data, metrics, title, width = 50) {
    if (data.length === 0) return 'No data available';
    
    const latest = data[data.length - 1];
    const chart = [];
    chart.push(`📊 ${title}`);
    chart.push('═'.repeat(width));
    
    metrics.forEach(({ key, label, max = 100 }) => {
      const value = latest[key] || 0;
      const percentage = Math.max(0, Math.min(100, (value / max) * 100));
      const barLength = Math.floor((percentage / 100) * (width - 25));
      
      const bar = '█'.repeat(barLength) + '░'.repeat(Math.max(0, (width - 25) - barLength));
      const emoji = percentage >= 80 ? '🟢' : percentage >= 60 ? '🟡' : percentage >= 40 ? '🟠' : '🔴';
      
      chart.push(`${label.padEnd(15)} │${bar}│ ${value.toFixed(1).padStart(6)} ${emoji}`);
    });
    
    return chart.join('\n');
  }

  /**
   * Generate HTML dashboard
   */
  generateHTMLDashboard(data, outputFile) {
    const latest = data[data.length - 1];
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dhacle Quality Metrics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        .metric-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .good { color: #22c55e; }
        .warning { color: #f59e0b; }
        .danger { color: #ef4444; }
        .charts-section {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .chart-container {
            position: relative;
            height: 300px;
            margin-bottom: 30px;
        }
        .footer {
            text-align: center;
            color: #666;
            margin-top: 30px;
            font-size: 0.8em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Dhacle Quality Metrics Dashboard</h1>
        <p>Last updated: ${new Date(latest.timestamp).toLocaleString()}</p>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-label">Overall Quality</div>
            <div class="metric-value ${this.getScoreClass(latest.quality_score_overall)}">${latest.quality_score_overall.toFixed(1)}%</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Performance Score</div>
            <div class="metric-value ${this.getScoreClass(latest.performance_score)}">${latest.performance_score.toFixed(1)}%</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Security Score</div>
            <div class="metric-value ${this.getScoreClass(latest.security_score)}">${latest.security_score.toFixed(1)}%</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Modern React</div>
            <div class="metric-value ${this.getScoreClass(latest.modern_react_score)}">${latest.modern_react_score.toFixed(1)}%</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Total Assets</div>
            <div class="metric-value good">${latest.total_assets}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Asset Scan Time</div>
            <div class="metric-value ${latest.asset_scan_time < 1000 ? 'good' : latest.asset_scan_time < 3000 ? 'warning' : 'danger'}">${latest.asset_scan_time}ms</div>
        </div>
    </div>

    <div class="charts-section">
        <h2>📈 Quality Trends (Last ${data.length} days)</h2>
        <div class="chart-container">
            <canvas id="qualityChart"></canvas>
        </div>
    </div>

    <div class="charts-section">
        <h2>⚡ Performance Trends</h2>
        <div class="chart-container">
            <canvas id="performanceChart"></canvas>
        </div>
    </div>

    <div class="footer">
        <p>Generated by Dhacle Quality Tracking System v1.0</p>
        <p>Data points: ${data.length} | Period: ${data[0].date} to ${latest.date}</p>
    </div>

    <script>
        // Chart data
        const dates = ${JSON.stringify(data.map(d => d.date))};
        const qualityScores = ${JSON.stringify(data.map(d => d.quality_score_overall))};
        const performanceScores = ${JSON.stringify(data.map(d => d.performance_score))};
        const securityScores = ${JSON.stringify(data.map(d => d.security_score))};
        const assetScanTimes = ${JSON.stringify(data.map(d => d.asset_scan_time))};
        const contextLoadTimes = ${JSON.stringify(data.map(d => d.context_load_time))};

        // Quality Chart
        new Chart(document.getElementById('qualityChart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Overall Quality',
                        data: qualityScores,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Security Score',
                        data: securityScores,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Performance Score',
                        data: performanceScores,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Performance Chart
        new Chart(document.getElementById('performanceChart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Asset Scan Time (ms)',
                        data: assetScanTimes,
                        borderColor: 'rgb(245, 158, 11)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        yAxisID: 'y',
                        tension: 0.4
                    },
                    {
                        label: 'Context Load Time (ms)',
                        data: contextLoadTimes,
                        borderColor: 'rgb(168, 85, 247)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    </script>
</body>
</html>`;

    fs.writeFileSync(outputFile, html);
    return outputFile;
  }

  /**
   * Get CSS class for score
   */
  getScoreClass(score) {
    if (score >= 70) return 'good';
    if (score >= 40) return 'warning';
    return 'danger';
  }

  /**
   * Generate all visualizations
   */
  async generateAllCharts(days = 30) {
    console.log(`📊 Generating visualizations for last ${days} days...`);
    
    try {
      const data = this.loadMetricsData(days);
      
      if (data.length === 0) {
        console.log('❌ No data available for visualization.');
        return;
      }

      console.log(`📈 Found ${data.length} data points`);
      
      // ASCII Charts
      console.log('\n' + this.generateASCIIChart(data, 'quality_score_overall', 'Overall Quality Score Trend'));
      console.log('\n' + this.generateASCIIChart(data, 'asset_scan_time', 'Asset Scan Time Trend (ms)'));
      
      console.log('\n' + this.generateASCIIBarChart(data, [
        { key: 'quality_score_overall', label: 'Quality', max: 100 },
        { key: 'security_score', label: 'Security', max: 100 },
        { key: 'modern_react_score', label: 'Modern React', max: 100 },
        { key: 'performance_score', label: 'Performance', max: 100 }
      ], 'Current Metrics Summary'));
      
      // HTML Dashboard
      const htmlFile = path.join(CHARTS_DIR, `dashboard-${new Date().toISOString().split('T')[0]}.html`);
      this.generateHTMLDashboard(data, htmlFile);
      
      console.log(`\n📊 Charts generated:`);
      console.log(`  📈 ASCII charts: Displayed above`);
      console.log(`  🌐 HTML dashboard: ${htmlFile}`);
      console.log(`  💡 Open the HTML file in your browser for interactive charts!`);
      
      return {
        htmlDashboard: htmlFile,
        dataPoints: data.length,
        dateRange: {
          from: data[0].date,
          to: data[data.length - 1].date
        }
      };
      
    } catch (error) {
      console.error('💥 Visualization generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate trend analysis
   */
  generateTrendAnalysis(data, days) {
    if (data.length < 2) {
      return 'Insufficient data for trend analysis (need at least 2 data points).';
    }

    const latest = data[data.length - 1];
    const previous = data[0];
    
    const trends = {
      quality: latest.quality_score_overall - previous.quality_score_overall,
      performance: latest.performance_score - previous.performance_score,
      security: latest.security_score - previous.security_score,
      assets: latest.total_assets - previous.total_assets,
      scan_time: latest.asset_scan_time - previous.asset_scan_time
    };

    const analysis = [];
    analysis.push(`📊 TREND ANALYSIS (${days} days)`);
    analysis.push('=' .repeat(40));
    
    Object.entries(trends).forEach(([key, change]) => {
      const direction = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      const magnitude = Math.abs(change);
      let description = '';
      
      switch (key) {
        case 'quality':
          description = `Overall Quality: ${direction} ${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
          break;
        case 'performance':
          description = `Performance Score: ${direction} ${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
          break;
        case 'security':
          description = `Security Score: ${direction} ${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
          break;
        case 'assets':
          description = `Total Assets: ${direction} ${change > 0 ? '+' : ''}${change} items`;
          break;
        case 'scan_time':
          description = `Scan Time: ${direction} ${change > 0 ? '+' : ''}${change}ms ${change < 0 ? '(better)' : '(slower)'}`;
          break;
      }
      
      analysis.push(description);
    });
    
    return analysis.join('\n');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const visualizer = new ChartVisualizer();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📊 Dhacle Chart Visualization Tool

Usage:
  node scripts/chart-visualizer.js [options]

Options:
  --days <number>      Number of days to visualize (default: 30)
  --ascii-only        Generate only ASCII charts
  --html-only         Generate only HTML dashboard
  --trend             Show trend analysis
  --help, -h          Show this help

Examples:
  node scripts/chart-visualizer.js
  node scripts/chart-visualizer.js --days 14
  node scripts/chart-visualizer.js --ascii-only
  node scripts/chart-visualizer.js --trend
`);
    return;
  }

  const daysIndex = args.indexOf('--days');
  const days = daysIndex !== -1 ? parseInt(args[daysIndex + 1]) || 30 : 30;

  try {
    if (args.includes('--ascii-only')) {
      const data = visualizer.loadMetricsData(days);
      console.log(visualizer.generateASCIIChart(data, 'quality_score_overall', 'Quality Score Trend'));
      console.log('\n' + visualizer.generateASCIIChart(data, 'asset_scan_time', 'Asset Scan Time Trend (ms)'));
    } else if (args.includes('--html-only')) {
      const data = visualizer.loadMetricsData(days);
      const htmlFile = path.join(CHARTS_DIR, `dashboard-${new Date().toISOString().split('T')[0]}.html`);
      visualizer.generateHTMLDashboard(data, htmlFile);
      console.log(`🌐 HTML dashboard generated: ${htmlFile}`);
    } else if (args.includes('--trend')) {
      const data = visualizer.loadMetricsData(days);
      console.log(visualizer.generateTrendAnalysis(data, days));
    } else {
      // Generate all charts
      await visualizer.generateAllCharts(days);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled promise rejection:', error);
  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ChartVisualizer };