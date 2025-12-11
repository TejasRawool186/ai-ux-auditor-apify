// AI UI/UX Design Auditor - Main Crawler
// Powered by OpenAI GPT-4o Vision and Google Gemini
import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// AI UX Auditor - Users provide their own API keys

// Analysis prompts for each audit type
const ANALYSIS_PROMPTS = {
    general: `You are a world-class UI/UX Designer. Analyze this website screenshot and evaluate:
- Overall visual aesthetics and design quality
- Layout and visual hierarchy
- Typography and readability
- Color scheme effectiveness
- User experience and usability
- First impression impact

Provide a comprehensive analysis.`,

    accessibility: `You are a WCAG accessibility expert. Analyze this website screenshot for:
- Color contrast ratios (text vs background)
- Button and touch target sizes
- Visual clarity for screen readers
- Font sizes and readability
- Accessible color combinations
- Inclusive design patterns

Focus on visual accessibility issues.`,

    conversion: `You are a Conversion Rate Optimization (CRO) expert. Analyze this website for:
- Call-to-action (CTA) visibility and effectiveness
- Trust signals and social proof
- User friction points
- Value proposition clarity
- Visual persuasion elements
- Conversion funnel clarity

Identify barriers to conversion.`,

    performance: `You are a web performance expert. Analyze this screenshot for visual indicators of:
- Image optimization opportunities
- Perceived load performance
- Layout shift indicators
- Above-the-fold optimization
- Visual weight and bloat
- Mobile performance considerations

Focus on visual performance signals.`,

    seo: `You are an SEO expert. Analyze this screenshot for visible on-page SEO elements:
- Heading structure and hierarchy (H1-H6)
- Content organization and scannability
- Visual content structure
- Keyword prominence
- Meta content visibility
- User engagement elements

Focus on visually detectable SEO factors.`,

    'mobile-first': `You are a mobile UX specialist. Analyze this screenshot for:
- Mobile-first design principles
- Touch-friendly interface elements
- Responsive design patterns
- Mobile navigation effectiveness
- Thumb-friendly zones
- Screen real estate usage

Evaluate mobile user experience.`,

    'brand-consistency': `You are a brand identity expert. Analyze this screenshot for:
- Color palette consistency and harmony
- Typography hierarchy and selection
- Visual brand elements
- Design system consistency
- Brand personality expression
- Visual coherence

Extract color palette and evaluate brand design.`
};

// Initialize AI provider based on API key
function initializeAIProvider(apiKey) {
    if (!apiKey) {
        throw new Error('API Key is required. Please provide your OpenAI, OpenRouter, or Gemini API key.');
    }

    // Auto-detect API provider based on key format
    if (apiKey.startsWith('sk-or-')) {
        console.log('🤖 Detected OpenRouter API Key');
        return {
            type: 'openrouter',
            client: new OpenAI({
                apiKey,
                baseURL: 'https://openrouter.ai/api/v1',
                defaultHeaders: {
                    'HTTP-Referer': 'https://apify.com/',
                    'X-Title': 'Apify UI/UX Auditor',
                },
            }),
            model: 'openai/gpt-4o-mini' // More reliable and faster
        };
    } else if (apiKey.startsWith('sk-')) {
        console.log('🤖 Detected OpenAI API Key');
        return {
            type: 'openai',
            client: new OpenAI({ apiKey }),
            model: 'gpt-4o'
        };
    } else if (apiKey.startsWith('AIza')) {
        console.log('🤖 Detected Google Gemini API Key');
        return {
            type: 'gemini',
            client: new GoogleGenerativeAI(apiKey)
        };
    } else {
        throw new Error('Invalid API key format. Please provide a valid OpenAI (sk-...), OpenRouter (sk-or-...), or Gemini (AIza...) API key.');
    }
}

// Technology detection function
async function detectTechnologies(page) {
    const technologies = {
        frontend_framework: null,
        css_framework: null,
        javascript_libraries: [],
        analytics: [],
        hosting_provider: null,
        cdn: null,
        cms: null,
        ecommerce: null,
        payment_processors: [],
        chat_widgets: [],
        marketing_tools: [],
        security: [],
        performance: [],
        fonts: [],
        icons: [],
        meta_generator: null,
        server_info: null
    };

    try {
        // Detect technologies by analyzing page content
        const techData = await page.evaluate(() => {
            const detectedTech = {
                scripts: [],
                stylesheets: [],
                metaTags: {},
                globalObjects: [],
                comments: []
            };

            // Get all script sources
            const scripts = document.querySelectorAll('script[src]');
            scripts.forEach(script => {
                if (script.src) detectedTech.scripts.push(script.src);
            });

            // Get all stylesheet sources
            const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
            stylesheets.forEach(link => {
                if (link.href) detectedTech.stylesheets.push(link.href);
            });

            // Get meta tags
            const metaTags = document.querySelectorAll('meta');
            metaTags.forEach(meta => {
                const name = meta.getAttribute('name') || meta.getAttribute('property');
                const content = meta.getAttribute('content');
                if (name && content) {
                    detectedTech.metaTags[name] = content;
                }
            });

            // Check for global JavaScript objects
            const globalChecks = [
                'React', 'Vue', 'Angular', 'jQuery', '$', 'Shopify', 'WordPress',
                'gtag', 'ga', 'fbq', 'Intercom', 'Zendesk', 'Stripe', 'PayPal'
            ];
            
            globalChecks.forEach(obj => {
                if (window[obj]) {
                    detectedTech.globalObjects.push(obj);
                }
            });

            // Get HTML comments (often contain generator info)
            const walker = document.createTreeWalker(
                document.documentElement,
                NodeFilter.SHOW_COMMENT
            );
            let comment;
            while (comment = walker.nextNode()) {
                detectedTech.comments.push(comment.textContent.trim());
            }

            return detectedTech;
        });

        // Analyze the collected data to identify technologies
        
        // Frontend Frameworks
        if (techData.globalObjects.includes('React') || 
            techData.scripts.some(src => src.includes('react'))) {
            technologies.frontend_framework = 'React';
        } else if (techData.globalObjects.includes('Vue') || 
                   techData.scripts.some(src => src.includes('vue'))) {
            technologies.frontend_framework = 'Vue.js';
        } else if (techData.globalObjects.includes('Angular') || 
                   techData.scripts.some(src => src.includes('angular'))) {
            technologies.frontend_framework = 'Angular';
        }

        // CSS Frameworks
        if (techData.stylesheets.some(href => href.includes('bootstrap'))) {
            technologies.css_framework = 'Bootstrap';
        } else if (techData.stylesheets.some(href => href.includes('tailwind'))) {
            technologies.css_framework = 'Tailwind CSS';
        } else if (techData.stylesheets.some(href => href.includes('bulma'))) {
            technologies.css_framework = 'Bulma';
        }

        // JavaScript Libraries
        if (techData.globalObjects.includes('jQuery') || techData.globalObjects.includes('$')) {
            technologies.javascript_libraries.push('jQuery');
        }
        if (techData.scripts.some(src => src.includes('lodash'))) {
            technologies.javascript_libraries.push('Lodash');
        }
        if (techData.scripts.some(src => src.includes('axios'))) {
            technologies.javascript_libraries.push('Axios');
        }

        // Analytics
        if (techData.globalObjects.includes('gtag') || techData.globalObjects.includes('ga') ||
            techData.scripts.some(src => src.includes('googletagmanager'))) {
            technologies.analytics.push('Google Analytics');
        }
        if (techData.globalObjects.includes('fbq') || 
            techData.scripts.some(src => src.includes('facebook.net'))) {
            technologies.analytics.push('Facebook Pixel');
        }

        // CMS Detection
        if (techData.metaTags.generator) {
            const generator = techData.metaTags.generator.toLowerCase();
            if (generator.includes('wordpress')) {
                technologies.cms = 'WordPress';
            } else if (generator.includes('drupal')) {
                technologies.cms = 'Drupal';
            } else if (generator.includes('joomla')) {
                technologies.cms = 'Joomla';
            }
            technologies.meta_generator = techData.metaTags.generator;
        }

        // E-commerce
        if (techData.globalObjects.includes('Shopify') || 
            techData.scripts.some(src => src.includes('shopify'))) {
            technologies.ecommerce = 'Shopify';
        } else if (techData.scripts.some(src => src.includes('woocommerce'))) {
            technologies.ecommerce = 'WooCommerce';
        }

        // Payment Processors
        if (techData.globalObjects.includes('Stripe') || 
            techData.scripts.some(src => src.includes('stripe'))) {
            technologies.payment_processors.push('Stripe');
        }
        if (techData.globalObjects.includes('PayPal') || 
            techData.scripts.some(src => src.includes('paypal'))) {
            technologies.payment_processors.push('PayPal');
        }

        // Chat Widgets
        if (techData.globalObjects.includes('Intercom') || 
            techData.scripts.some(src => src.includes('intercom'))) {
            technologies.chat_widgets.push('Intercom');
        }
        if (techData.globalObjects.includes('Zendesk') || 
            techData.scripts.some(src => src.includes('zendesk'))) {
            technologies.chat_widgets.push('Zendesk');
        }

        // Fonts
        if (techData.stylesheets.some(href => href.includes('fonts.googleapis.com'))) {
            technologies.fonts.push('Google Fonts');
        }
        if (techData.stylesheets.some(href => href.includes('typekit') || href.includes('adobe'))) {
            technologies.fonts.push('Adobe Fonts');
        }

        // Icons
        if (techData.stylesheets.some(href => href.includes('font-awesome'))) {
            technologies.icons.push('Font Awesome');
        }
        if (techData.stylesheets.some(href => href.includes('heroicons'))) {
            technologies.icons.push('Heroicons');
        }

        // CDN Detection
        if (techData.scripts.some(src => src.includes('cloudflare')) || 
            techData.stylesheets.some(href => href.includes('cloudflare'))) {
            technologies.cdn = 'Cloudflare';
        } else if (techData.scripts.some(src => src.includes('jsdelivr'))) {
            technologies.cdn = 'jsDelivr';
        }

        // Security
        if (window.location.protocol === 'https:') {
            technologies.security.push('SSL Certificate');
        }

        // Performance
        if ('serviceWorker' in navigator) {
            technologies.performance.push('Service Worker');
        }

    } catch (error) {
        console.log(`⚠️ Technology detection failed: ${error.message}`);
    }

    return technologies;
}

// Call OpenAI/OpenRouter API with retry logic
async function analyzeWithOpenAI(client, screenshotBase64, analysisType, url, model = 'gpt-4o') {
    const prompt = ANALYSIS_PROMPTS[analysisType] || ANALYSIS_PROMPTS.general;

    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 API attempt ${attempt}/${maxRetries}`);

            const response = await client.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: `${prompt}

Output a strict JSON object with this exact structure:
{
  "score": <number 1-10>,
  "summary": "<brief overall assessment>",
  "color_palette": ["#hex1", "#hex2", "#hex3"],
  "design_flaws": ["flaw 1", "flaw 2", ...],
  "positive_aspects": ["positive 1", "positive 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analyze this ${analysisType} audit for: ${url}`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/png;base64,${screenshotBase64}`
                                }
                            }
                        ]
                    }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1500
            });

            return JSON.parse(response.choices[0].message.content);

        } catch (error) {
            lastError = error;
            console.log(`⚠️ Attempt ${attempt} failed: ${error.message}`);

            // Check if it's a rate limit error
            if (error.message?.includes('429') || error.message?.includes('rate limit')) {
                const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.log(`⏳ Rate limit hit, waiting ${waitTime/1000}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                // Non-rate-limit error, don't retry
                throw error;
            }
        }
    }

    throw new Error(`API failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

// Removed demo analysis - users must provide API keys

// Call Google Gemini Vision API (Native) - Simplified
async function analyzeWithGemini(client, screenshotBase64, analysisType, url) {
    const prompt = ANALYSIS_PROMPTS[analysisType] || ANALYSIS_PROMPTS.general;

    const fullPrompt = `${prompt}

Analyze this ${analysisType} audit for: ${url}

Output a strict JSON object with this exact structure:
{
  "score": <number 1-10>,
  "summary": "<brief overall assessment>",
  "color_palette": ["#hex1", "#hex2", "#hex3"],
  "design_flaws": ["flaw 1", "flaw 2", ...],
  "positive_aspects": ["positive 1", "positive 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`;

    const imagePart = {
        inlineData: {
            data: screenshotBase64,
            mimeType: 'image/png'
        }
    };

    // Use the most reliable model
    const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash-latest'
    });

    const result = await model.generateContent([fullPrompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
}

// Main actor entry point
await Actor.main(async () => {
    console.log('🚀 AI UI/UX Design Auditor - Starting...');

    // Get actor input
    let input = await Actor.getInput();
    
    // If no input provided (local testing), throw error
    if (!input) {
        throw new Error('No input provided. Please configure the actor with your API key and URLs to analyze.');
    }

    const {
        startUrls = [],
        apiKey,
        analysisType = 'general',
        viewPort = 'desktop',
        proxyConfiguration,
        maxConcurrency = 5
    } = input;

    // Validate inputs
    if (!startUrls || startUrls.length === 0) {
        throw new Error('No URLs provided. Please add at least one URL to analyze.');
    }

    if (!apiKey) {
        throw new Error('API Key is required. Please provide your OpenAI, OpenRouter, or Gemini API key.');
    }

    // Initialize AI provider
    let aiProvider;
    try {
        aiProvider = initializeAIProvider(apiKey);
    } catch (error) {
        throw new Error(`Failed to initialize AI provider: ${error.message}`);
    }

    // Configure viewport dimensions
    const viewportConfig = viewPort === 'mobile'
        ? { width: 390, height: 844 }
        : { width: 1920, height: 1080 };

    console.log(`📱 Viewport: ${viewPort} (${viewportConfig.width}x${viewportConfig.height})`);
    console.log(`🎯 Analysis Type: ${analysisType}`);
    console.log(`🤖 AI Provider: ${aiProvider.type.toUpperCase()}`);
    console.log(`🔑 Using your API key for unlimited analysis`);

    // Initialize Playwright Crawler
    const crawler = new PlaywrightCrawler({
        proxyConfiguration: await Actor.createProxyConfiguration(proxyConfiguration),
        maxConcurrency,

        launchContext: {
            launchOptions: {
                headless: true
            }
        },

        preNavigationHooks: [
            async ({ page }) => {
                // Set viewport
                await page.setViewportSize(viewportConfig);
            }
        ],

        async requestHandler({ request, page, log }) {
            const url = request.url;
            log.info(`🔍 Analyzing: ${url}`);

            // Process the URL

            try {
                // Navigate and wait for page to fully load
                log.info('⏳ Waiting for page to load...');
                await page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                });
                
                // Wait a bit more for dynamic content
                await page.waitForTimeout(2000);

                // Try to dismiss common cookie consent popups
                const cookieSelectors = [
                    '#onetrust-accept-btn-handler',
                    'button[aria-label="Accept"]',
                    'button[aria-label="Accept all"]',
                    '.cookie-accept',
                    '[class*="cookie"] button[class*="accept"]',
                    '#accept-cookies'
                ];

                for (const selector of cookieSelectors) {
                    try {
                        const button = await page.$(selector);
                        if (button) {
                            await button.click();
                            log.info('✅ Dismissed cookie consent');
                            await page.waitForTimeout(1000);
                            break;
                        }
                    } catch (e) {
                        // Ignore errors - cookie popup might not exist
                    }
                }

                // Detect technologies used on the website
                log.info('🔍 Detecting technologies...');
                const technologies = await detectTechnologies(page);

                // Capture screenshot
                log.info('📸 Capturing screenshot...');
                const screenshotBuffer = await page.screenshot({
                    type: 'png',
                    fullPage: false, // Only above the fold
                    timeout: 30000 // 30 second timeout
                });

                // Convert to base64
                const screenshotBase64 = screenshotBuffer.toString('base64');

                // Save screenshot to key-value store
                const screenshotKey = `SCREENSHOT_${request.id}.png`;
                await Actor.setValue(screenshotKey, screenshotBuffer, { contentType: 'image/png' });

                const keyValueStore = await Actor.openKeyValueStore();
                const storeId = keyValueStore.id;
                const screenshotUrl = `https://api.apify.com/v2/key-value-stores/${storeId}/records/${screenshotKey}`;

                log.info(`💾 Screenshot saved: ${screenshotKey}`);

                // Perform AI analysis
                log.info(`🤖 Analyzing with ${aiProvider.type.toUpperCase()}...`);
                let aiResult;

                try {
                    if (aiProvider.type === 'openai' || aiProvider.type === 'openrouter') {
                        aiResult = await analyzeWithOpenAI(
                            aiProvider.client,
                            screenshotBase64,
                            analysisType,
                            url,
                            aiProvider.model
                        );
                    } else if (aiProvider.type === 'gemini') {
                        aiResult = await analyzeWithGemini(
                            aiProvider.client,
                            screenshotBase64,
                            analysisType,
                            url
                        );
                    } else {
                        throw new Error(`Unsupported AI provider: ${aiProvider.type}`);
                    }

                } catch (apiError) {
                    log.error(`❌ AI Analysis failed: ${apiError.message}`);

                    // Check for specific error types
                    if (apiError.message?.includes('401') || apiError.message?.includes('authentication')) {
                        throw new Error('Invalid API Key provided. Please check your API key.');
                    } else if (apiError.message?.includes('429') || apiError.message?.includes('rate limit')) {
                        throw new Error('Rate limit exceeded. Please try again in a few minutes or upgrade your API plan.');
                    } else if (apiError.message?.includes('insufficient_quota') || apiError.message?.includes('quota')) {
                        throw new Error('API quota exceeded. Please check your API account balance or upgrade your plan.');
                    }

                    throw new Error(`AI analysis failed: ${apiError.message}`);
                }

                // Construct final result
                const auditResult = {
                    url,
                    audit_date: new Date().toISOString(),
                    analysis_type: analysisType,
                    viewport: viewPort,
                    ai_provider: aiProvider.type,
                    score: aiResult.score || 0,
                    summary: aiResult.summary || 'No summary available',
                    color_palette: aiResult.color_palette || [],
                    design_flaws: aiResult.design_flaws || [],
                    positive_aspects: aiResult.positive_aspects || [],
                    recommendations: aiResult.recommendations || [],
                    screenshot_url: screenshotUrl,
                    technology_stack: technologies
                };

                // Save result to dataset
                await Actor.pushData(auditResult);
                log.info(`✅ Audit complete for ${url} - Score: ${auditResult.score}/10`);

            } catch (error) {
                log.error(`❌ Error processing ${url}: ${error.message}`);

                // Push failed result to dataset
                await Actor.pushData({
                    url,
                    status: 'FAILED',
                    error: error.message,
                    audit_date: new Date().toISOString(),
                    analysis_type: analysisType,
                    viewport: viewPort
                });
            }
        },

        failedRequestHandler({ request, log }) {
            log.error(`💥 Request failed after retries: ${request.url}`);
        }
    });

    // Convert startUrls format for crawler
    const urls = startUrls.map(item => typeof item === 'string' ? item : item.url);
    
    // Run the crawler
    await crawler.run(urls);

    console.log('✨ AI UI/UX Design Auditor - Completed!');
    console.log(`📊 Analysis completed using your ${aiProvider.type.toUpperCase()} API key`);
});
