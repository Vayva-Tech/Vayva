#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 * 
 * Detailed analysis of bundle composition to identify optimization opportunities.
 * Generates report showing largest dependencies and code splitting recommendations.
 */

import { statSync, readdirSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

const BUILD_DIR = 'apps/merchant-admin/.next/static/chunks';
const REPORT_FILE = 'bundle-analysis-report.json';

class BundleAnalyzer {
    constructor() {
        this.chunks = [];
        this.dependencies = new Map();
        this.totalSize = 0;
    }

    analyzeDirectory(dirPath) {
        const files = readdirSync(dirPath);

        for (const file of files) {
            const filePath = join(dirPath, file);
            const stat = statSync(filePath);

            if (stat.isDirectory()) {
                this.analyzeDirectory(filePath);
            } else if (file.endsWith('.js') && !file.endsWith('.map')) {
                const size = stat.size;
                const relativePath = relative(BUILD_DIR, filePath);

                this.chunks.push({
                    path: relativePath,
                    size: size,
                    sizeFormatted: this.formatSize(size)
                });

                this.totalSize += size;

                // Extract dependency name from filename pattern
                const depMatch = file.match(/^(node_modules_)?([^._-]+).*\.js$/);
                if (depMatch) {
                    const depName = depMatch[2];
                    const current = this.dependencies.get(depName) || 0;
                    this.dependencies.set(depName, current + size);
                }
            }
        }
    }

    formatSize(bytes) {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
    }

    generateReport() {
        // Sort chunks by size
        const sortedChunks = [...this.chunks].sort((a, b) => b.size - a.size);
        
        // Top 20 largest chunks
        const topChunks = sortedChunks.slice(0, 20);

        // Sort dependencies by size
        const sortedDeps = [...this.dependencies.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        const report = {
            summary: {
                totalSize: this.totalSize,
                totalSizeFormatted: this.formatSize(this.totalSize),
                totalChunks: this.chunks.length,
                averageChunkSize: this.formatSize(Math.round(this.totalSize / this.chunks.length))
            },
            topChunks: topChunks,
            topDependencies: sortedDeps.map(([name, size]) => ({
                name,
                size,
                sizeFormatted: this.formatSize(size),
                percentage: ((size / this.totalSize) * 100).toFixed(1) + '%'
            })),
            recommendations: this.generateRecommendations(sortedChunks, sortedDeps)
        };

        return report;
    }

    generateRecommendations(chunks, deps) {
        const recommendations = [];

        // Check for large dependencies
        const largeDeps = deps.filter(([_, size]) => size > 500 * 1024);
        if (largeDeps.length > 0) {
            recommendations.push({
                type: 'warning',
                message: `Found ${largeDeps.length} dependencies over 500KB`,
                action: 'Consider lazy loading or tree-shaking these dependencies'
            });
        }

        // Check for large chunks
        const largeChunks = chunks.filter(chunk => chunk.size > 300 * 1024);
        if (largeChunks.length > 0) {
            recommendations.push({
                type: 'info',
                message: `${largeChunks.length} chunks exceed 300KB`,
                action: 'Implement code splitting for large route chunks'
            });
        }

        // Check total size
        if (this.totalSize > 6 * 1024 * 1024) {
            recommendations.push({
                type: 'error',
                message: 'Total bundle size exceeds 6MB target',
                action: 'Urgent: Implement aggressive code splitting and lazy loading'
            });
        }

        return recommendations;
    }

    printReport(report) {
        console.log('\n📦 Bundle Analysis Report\n');
        console.log('='.repeat(60));
        
        console.log('\n📊 Summary:');
        console.log(`   Total Size: ${report.summary.totalSizeFormatted}`);
        console.log(`   Total Chunks: ${report.summary.totalChunks}`);
        console.log(`   Average Chunk: ${report.summary.averageChunkSize}`);

        console.log('\n🔝 Top 10 Largest Chunks:');
        report.topChunks.slice(0, 10).forEach((chunk, i) => {
            console.log(`   ${i + 1}. ${chunk.path.padEnd(40)} ${chunk.sizeFormatted}`);
        });

        console.log('\n📦 Top 10 Dependencies:');
        report.topDependencies.slice(0, 10).forEach((dep, i) => {
            console.log(`   ${i + 1}. ${dep.name.padEnd(25)} ${dep.sizeFormatted.padEnd(10)} (${dep.percentage})`);
        });

        console.log('\n💡 Recommendations:');
        report.recommendations.forEach((rec, i) => {
            const icon = rec.type === 'error' ? '❌' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
            console.log(`   ${icon} ${rec.message}`);
            console.log(`      → ${rec.action}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log(`\n💾 Full report saved to: ${REPORT_FILE}\n`);
    }

    saveReport(report) {
        writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
    }
}

// Run analysis
console.log('🔍 Analyzing bundle composition...\n');

const analyzer = new BundleAnalyzer();
analyzer.analyzeDirectory(join(process.cwd(), BUILD_DIR));

const report = analyzer.generateReport();
analyzer.printReport(report);
analyzer.saveReport(report);
