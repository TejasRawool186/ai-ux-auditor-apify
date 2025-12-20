// Dashboard Generator - Creates beautiful HTML reports for AI UX Auditor
// Generates a self-contained, interactive dashboard with all audit results

/**
 * Generate a complete HTML dashboard from audit results
 * @param {Array} auditResults - Array of audit result objects
 * @returns {string} Complete HTML document
 */
export function generateDashboard(auditResults) {
    // Filter out flattened reports (we only want the comprehensive ones)
    const results = auditResults.filter(r => !r._type || r._type !== 'flattened_report');
    
    if (results.length === 0) {
        return generateEmptyDashboard();
    }

    const auditDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI UX Audit Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        ${getStyles()}
    </style>
</head>
<body>
    <div class="dashboard">
        ${generateHeader(auditDate, results.length)}
        
        <main class="main-content">
            ${results.map((result, index) => generateAuditCard(result, index)).join('')}
        </main>
        
        ${generateFooter()}
    </div>
    
    <script>
        ${getScripts()}
    </script>
</body>
</html>`;
}

function generateEmptyDashboard() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI UX Audit Dashboard</title>
    <style>
        body { 
            font-family: 'Inter', sans-serif; 
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .empty-state {
            text-align: center;
            padding: 3rem;
        }
        .empty-state h1 { font-size: 2rem; margin-bottom: 1rem; }
        .empty-state p { opacity: 0.7; }
    </style>
</head>
<body>
    <div class="empty-state">
        <h1>📊 No Audit Results</h1>
        <p>No completed audits found. Run the Actor to generate results.</p>
    </div>
</body>
</html>`;
}

function getStyles() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #0a0a1a;
            --bg-secondary: #12122a;
            --bg-card: rgba(30, 30, 60, 0.6);
            --bg-glass: rgba(255, 255, 255, 0.03);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.7);
            --text-muted: rgba(255, 255, 255, 0.5);
            --accent-primary: #6366f1;
            --accent-secondary: #8b5cf6;
            --accent-success: #10b981;
            --accent-warning: #f59e0b;
            --accent-danger: #ef4444;
            --accent-info: #3b82f6;
            --gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            --gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            --gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            --shadow-glow: 0 0 40px rgba(99, 102, 241, 0.15);
            --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .dashboard {
            max-width: 1600px;
            margin: 0 auto;
            padding: 2rem;
        }

        /* Header */
        .header {
            text-align: center;
            padding: 3rem 2rem;
            background: var(--gradient-primary);
            border-radius: 24px;
            margin-bottom: 2rem;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            opacity: 0.5;
        }

        .header-content {
            position: relative;
            z-index: 1;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .header-stats {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin-top: 2rem;
        }

        .header-stat {
            text-align: center;
        }

        .header-stat-value {
            font-size: 2rem;
            font-weight: 700;
        }

        .header-stat-label {
            font-size: 0.875rem;
            opacity: 0.8;
        }

        /* Audit Cards */
        .audit-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(20px);
            box-shadow: var(--shadow-card);
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .audit-card:nth-child(1) { animation-delay: 0.1s; }
        .audit-card:nth-child(2) { animation-delay: 0.2s; }
        .audit-card:nth-child(3) { animation-delay: 0.3s; }
        .audit-card:nth-child(4) { animation-delay: 0.4s; }
        .audit-card:nth-child(5) { animation-delay: 0.5s; }

        .audit-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .url-info h2 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            word-break: break-all;
        }

        .url-info h2 a {
            color: var(--text-primary);
            text-decoration: none;
            transition: color 0.3s;
        }

        .url-info h2 a:hover {
            color: var(--accent-primary);
        }

        .badges {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .badge {
            padding: 0.35rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
            background: var(--bg-glass);
            border: 1px solid var(--border-color);
        }

        .badge-primary { background: rgba(99, 102, 241, 0.2); border-color: rgba(99, 102, 241, 0.4); }
        .badge-success { background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4); }

        .overall-score {
            text-align: center;
            min-width: 100px;
        }

        /* Score Circle */
        .score-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            position: relative;
            margin: 0 auto 0.5rem;
        }

        .score-circle::before {
            content: '';
            position: absolute;
            inset: -3px;
            border-radius: 50%;
            padding: 3px;
            background: var(--gradient-primary);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
        }

        .score-circle.excellent { --gradient-primary: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .score-circle.good { --gradient-primary: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
        .score-circle.average { --gradient-primary: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .score-circle.poor { --gradient-primary: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }

        .score-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Scores Grid */
        .scores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .score-item {
            background: var(--bg-glass);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .score-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .score-item-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .score-item-value {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .score-item-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        /* Progress Bar */
        .progress-bar {
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin-top: 0.5rem;
        }

        .progress-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 1s ease;
        }

        .progress-fill.excellent { background: var(--accent-success); }
        .progress-fill.good { background: var(--accent-info); }
        .progress-fill.average { background: var(--accent-warning); }
        .progress-fill.poor { background: var(--accent-danger); }

        /* AI Summary */
        .ai-summary {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .ai-summary-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            font-weight: 600;
            color: var(--accent-primary);
        }

        .ai-summary p {
            color: var(--text-secondary);
            line-height: 1.8;
        }

        /* Color Palette */
        .color-palette {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-bottom: 2rem;
        }

        .color-swatch {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 0.5rem;
            font-size: 0.65rem;
            font-weight: 500;
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s;
            cursor: pointer;
        }

        .color-swatch:hover {
            transform: scale(1.1);
        }

        /* Sections */
        .section-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Cards Grid */
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .info-card {
            background: var(--bg-glass);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
        }

        .info-card h3 {
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-card ul {
            list-style: none;
        }

        .info-card li {
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-color);
            font-size: 0.875rem;
            color: var(--text-secondary);
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }

        .info-card li:last-child {
            border-bottom: none;
        }

        .info-card li::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--accent-primary);
            flex-shrink: 0;
            margin-top: 0.5rem;
        }

        .info-card.positive li::before { background: var(--accent-success); }
        .info-card.negative li::before { background: var(--accent-danger); }
        .info-card.recommendation li::before { background: var(--accent-warning); }

        /* Tech Stack */
        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .tech-badge {
            background: var(--bg-glass);
            border: 1px solid var(--border-color);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .tech-badge.detected {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
            color: var(--accent-success);
        }

        /* Screenshot */
        .screenshot-container {
            margin-top: 2rem;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid var(--border-color);
        }

        .screenshot-header {
            background: var(--bg-glass);
            padding: 0.75rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border-bottom: 1px solid var(--border-color);
        }

        .screenshot-dots {
            display: flex;
            gap: 6px;
        }

        .screenshot-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }

        .screenshot-dot.red { background: #ff5f57; }
        .screenshot-dot.yellow { background: #febc2e; }
        .screenshot-dot.green { background: #28c840; }

        .screenshot-img {
            width: 100%;
            display: block;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        .footer a {
            color: var(--accent-primary);
            text-decoration: none;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .dashboard {
                padding: 1rem;
            }

            .header {
                padding: 2rem 1rem;
            }

            .header h1 {
                font-size: 1.75rem;
            }

            .header-stats {
                gap: 1.5rem;
            }

            .audit-card {
                padding: 1.5rem;
            }

            .audit-card-header {
                flex-direction: column;
            }

            .overall-score {
                align-self: flex-start;
            }

            .scores-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .cards-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Animations */
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .loading {
            animation: pulse 2s infinite;
        }

        /* Tooltip */
        .tooltip {
            position: relative;
        }

        .tooltip::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            padding: 0.5rem 0.75rem;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.75rem;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
        }

        .tooltip:hover::after {
            opacity: 1;
            visibility: visible;
        }
    `;
}

function generateHeader(auditDate, totalUrls) {
    return `
        <header class="header">
            <div class="header-content">
                <h1>🚀 AI UX Audit Dashboard</h1>
                <p class="subtitle">Comprehensive Website Analysis Report</p>
                <div class="header-stats">
                    <div class="header-stat">
                        <div class="header-stat-value">${totalUrls}</div>
                        <div class="header-stat-label">URLs Analyzed</div>
                    </div>
                    <div class="header-stat">
                        <div class="header-stat-value">7</div>
                        <div class="header-stat-label">Audit Categories</div>
                    </div>
                    <div class="header-stat">
                        <div class="header-stat-value">${auditDate.split(',')[0]}</div>
                        <div class="header-stat-label">Generated</div>
                    </div>
                </div>
            </div>
        </header>
    `;
}

function getScoreClass(score) {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'average';
    return 'poor';
}

function generateAuditCard(result, index) {
    const overallScore = result.overall_score || result.scores?.overall_ux || 0;
    const scores = result.scores || {};
    
    return `
        <article class="audit-card" style="animation-delay: ${index * 0.1}s">
            <div class="audit-card-header">
                <div class="url-info">
                    <h2><a href="${result.url}" target="_blank" rel="noopener">${result.url}</a></h2>
                    <div class="badges">
                        <span class="badge badge-primary">📊 ${result.analysis_type || 'General'}</span>
                        <span class="badge">${result.viewport === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}</span>
                        <span class="badge badge-success">🤖 ${(result.ai_provider || 'AI').toUpperCase()}</span>
                    </div>
                </div>
                <div class="overall-score">
                    <div class="score-circle ${getScoreClass(overallScore)}">
                        ${overallScore.toFixed(1)}
                    </div>
                    <div class="score-label">Overall Score</div>
                </div>
            </div>

            <!-- Scores Grid -->
            <div class="scores-grid">
                ${generateScoreItem('⚡', 'Performance', scores.performance || 0)}
                ${generateScoreItem('♿', 'Accessibility', scores.accessibility || 0)}
                ${generateScoreItem('📱', 'Mobile', scores.mobile || 0)}
                ${generateScoreItem('🔍', 'SEO', scores.seo || 0)}
                ${generateScoreItem('📝', 'Content', scores.content || 0)}
                ${generateScoreItem('💰', 'Conversion', scores.conversion || 0)}
            </div>

            <!-- AI Summary -->
            ${result.ai_summary ? `
                <div class="ai-summary">
                    <div class="ai-summary-header">
                        <span>🤖</span> AI Analysis Summary
                    </div>
                    <p>${escapeHtml(result.ai_summary)}</p>
                </div>
            ` : ''}

            <!-- Color Palette -->
            ${result.color_palette && result.color_palette.length > 0 ? `
                <div class="section-title">🎨 Detected Color Palette</div>
                <div class="color-palette">
                    ${result.color_palette.map(color => `
                        <div class="color-swatch tooltip" 
                             style="background-color: ${color}" 
                             data-tooltip="Click to copy"
                             onclick="navigator.clipboard.writeText('${color}')">
                            ${color}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Info Cards -->
            <div class="cards-grid">
                ${generateInfoCard('✅ Strengths', result.positive_aspects, 'positive')}
                ${generateInfoCard('⚠️ Issues Found', result.design_flaws, 'negative')}
                ${generateInfoCard('💡 Recommendations', result.ai_recommendations, 'recommendation')}
            </div>

            <!-- Tech Stack -->
            ${result.technology_stack ? generateTechStack(result.technology_stack) : ''}

            <!-- Screenshot -->
            ${result.screenshot_url ? `
                <div class="screenshot-container">
                    <div class="screenshot-header">
                        <div class="screenshot-dots">
                            <div class="screenshot-dot red"></div>
                            <div class="screenshot-dot yellow"></div>
                            <div class="screenshot-dot green"></div>
                        </div>
                        <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 0.5rem;">
                            ${result.url}
                        </span>
                    </div>
                    <a href="${result.screenshot_url}" target="_blank">
                        <img src="${result.screenshot_url}" alt="Website Screenshot" class="screenshot-img" loading="lazy">
                    </a>
                </div>
            ` : ''}
        </article>
    `;
}

function generateScoreItem(icon, label, score) {
    const scoreClass = getScoreClass(score);
    return `
        <div class="score-item">
            <div class="score-item-icon">${icon}</div>
            <div class="score-item-value">${score.toFixed ? score.toFixed(1) : score}</div>
            <div class="score-item-label">${label}</div>
            <div class="progress-bar">
                <div class="progress-fill ${scoreClass}" style="width: ${score * 10}%"></div>
            </div>
        </div>
    `;
}

function generateInfoCard(title, items, type) {
    if (!items || items.length === 0) {
        return `
            <div class="info-card ${type}">
                <h3>${title}</h3>
                <p style="color: var(--text-muted); font-size: 0.875rem;">No items found</p>
            </div>
        `;
    }

    return `
        <div class="info-card ${type}">
            <h3>${title}</h3>
            <ul>
                ${items.slice(0, 5).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
        </div>
    `;
}

function generateTechStack(tech) {
    const techItems = [];
    
    if (tech.frontend_framework) techItems.push({ name: tech.frontend_framework, detected: true });
    if (tech.css_framework) techItems.push({ name: tech.css_framework, detected: true });
    if (tech.cms) techItems.push({ name: tech.cms, detected: true });
    if (tech.ecommerce) techItems.push({ name: tech.ecommerce, detected: true });
    if (tech.analytics && tech.analytics.length > 0) {
        tech.analytics.forEach(a => techItems.push({ name: a, detected: true }));
    }
    if (tech.javascript_libraries && tech.javascript_libraries.length > 0) {
        tech.javascript_libraries.forEach(lib => techItems.push({ name: lib, detected: true }));
    }
    if (tech.fonts && tech.fonts.length > 0) {
        tech.fonts.forEach(font => techItems.push({ name: font, detected: true }));
    }

    if (techItems.length === 0) return '';

    return `
        <div class="section-title" style="margin-top: 1.5rem;">⚙️ Detected Technologies</div>
        <div class="tech-stack">
            ${techItems.map(item => `
                <span class="tech-badge ${item.detected ? 'detected' : ''}">${item.name}</span>
            `).join('')}
        </div>
    `;
}

function generateFooter() {
    return `
        <footer class="footer">
            <p>Generated by <a href="https://apify.com" target="_blank">🚀 AI UI/UX Auditor</a> on Apify</p>
            <p style="margin-top: 0.5rem; font-size: 0.75rem;">Powered by AI Vision Analysis</p>
        </footer>
    `;
}

function getScripts() {
    return `
        // Animate progress bars on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fills = entry.target.querySelectorAll('.progress-fill');
                    fills.forEach(fill => {
                        const width = fill.style.width;
                        fill.style.width = '0%';
                        setTimeout(() => {
                            fill.style.width = width;
                        }, 100);
                    });
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.audit-card').forEach(card => {
            observer.observe(card);
        });

        // Copy color to clipboard with feedback
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', function() {
                const color = this.textContent.trim();
                navigator.clipboard.writeText(color).then(() => {
                    const original = this.textContent;
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = original;
                    }, 1000);
                });
            });
        });

        console.log('🚀 AI UX Audit Dashboard loaded successfully!');
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, s => div[s]);
}

export default { generateDashboard };
