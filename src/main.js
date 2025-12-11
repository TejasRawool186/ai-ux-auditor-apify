// AI UI/UX Design Auditor - Main Crawler
// Powered by OpenAI GPT-4o Vision and Google Gemini
import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Free tier configuration - users must provide their own API key
const FREE_TIER_DAILY_LIMIT = 5;

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

// Initialize AI provider based on configuration
function initializeAIProvider(apiKey, useFreeMode) {
    // If free mode is enabled but no API key provided, show error
    if (useFreeMode && !apiKey) {
        throw new Error(`Free tier requires you to provide your own API key. Please:
1. Get a free Gemini API key from https://aistudio.google.com/app/apikey
2. Or get an OpenAI API key from https://platform.openai.com/api-keys
3. Add it to the "API Key" field in the actor input
4. Or disable "Use Free Tier" and the actor will show a demo error message`);
    }

    if (!apiKey) {
        // No API key provided and free mode disabled - return demo mode
        console.log('🎭 DEMO MODE: No API key provided. Will show sample analysis.');
        return {
            type: 'demo',
            client: null,
            model: 'demo'
        };
    }

    // Auto-detect API provider based on key format
    if (apiKey.startsWith('sk-or-')) {
        console.log('🤖 Detected OpenRouter API Key');
        return {
            type: 'openrouter',
            client: new OpenAI({
                apiKey,
                baseURL: 'https://openrouter.ai/api/v1'
            }),
            model: 'google/gemini-2.0-flash-exp:free' // Default model for user keys too, or user could specify but we keep it simple
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

// Track free tier usage (simple in-memory tracking per actor run)
const usageTracker = {
    count: 0,
    limit: FREE_TIER_DAILY_LIMIT,

    canProcess() {
        return this.count < this.limit;
    },

    increment() {
        this.count++;
    },

    getRemaining() {
        return Math.max(0, this.limit - this.count);
    }
};

// Call OpenAI/OpenRouter API
async function analyzeWithOpenAI(client, screenshotBase64, analysisType, url, model = 'gpt-4o') {
    const prompt = ANALYSIS_PROMPTS[analysisType] || ANALYSIS_PROMPTS.general;

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
}

// Demo analysis for when no API key is provided
function getDemoAnalysis(analysisType, url) {
    const demoResults = {
        general: {
            score: 7.5,
            summary: "Demo analysis: This appears to be a well-structured website with good visual hierarchy. The layout is clean and professional.",
            color_palette: ["#FFFFFF", "#000000", "#0066CC", "#F5F5F5", "#333333"],
            design_flaws: [
                "Demo: Some elements could benefit from better spacing",
                "Demo: Color contrast could be improved in certain areas",
                "Demo: Navigation could be more prominent"
            ],
            positive_aspects: [
                "Demo: Clean and professional layout",
                "Demo: Good use of whitespace",
                "Demo: Consistent typography throughout"
            ],
            recommendations: [
                "Demo: Consider adding more visual hierarchy",
                "Demo: Improve color contrast for better accessibility",
                "Demo: Add more prominent call-to-action buttons"
            ]
        },
        accessibility: {
            score: 6.8,
            summary: "Demo accessibility analysis: The site has basic accessibility features but needs improvements in contrast and keyboard navigation.",
            color_palette: ["#FFFFFF", "#000000", "#0066CC", "#F5F5F5"],
            design_flaws: [
                "Demo: Insufficient color contrast in some areas",
                "Demo: Missing alt text for images",
                "Demo: Keyboard navigation could be improved"
            ],
            positive_aspects: [
                "Demo: Semantic HTML structure appears to be used",
                "Demo: Text is generally readable",
                "Demo: Basic heading structure is present"
            ],
            recommendations: [
                "Demo: Increase color contrast to meet WCAG standards",
                "Demo: Add descriptive alt text for all images",
                "Demo: Implement better keyboard navigation"
            ]
        }
    };

    const result = demoResults[analysisType] || demoResults.general;
    return {
        ...result,
        demo_note: "This is a demo analysis. Provide your API key for real AI-powered insights."
    };
}

// Call Google Gemini Vision API (Native)
async function analyzeWithGemini(client, screenshotBase64, analysisType, url) {
    const prompt = ANALYSIS_PROMPTS[analysisType] || ANALYSIS_PROMPTS.general;

    const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            responseMimeType: 'application/json'
        }
    });

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
    
    // If no input provided (local testing), use default input
    if (!input) {
        console.log('⚠️ No input provided, using default input for local testing...');
        input = {
            startUrls: [{ url: 'https://www.apple.com' }],
            useFreeMode: false, // Demo mode for local testing
            analysisType: 'general',
            viewPort: 'desktop',
            maxConcurrency: 1
        };
    }

    const {
        startUrls = [],
        useFreeMode = true,
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

    // Initialize AI provider
    let aiProvider;
    try {
        aiProvider = initializeAIProvider(apiKey, useFreeMode);
    } catch (error) {
        throw new Error(`Failed to initialize AI provider: ${error.message}`);
    }

    const isFreeMode = useFreeMode && apiKey; // Free mode when user provides their own key
    const isDemoMode = aiProvider.type === 'demo';

    // Configure viewport dimensions
    const viewportConfig = viewPort === 'mobile'
        ? { width: 390, height: 844 }
        : { width: 1920, height: 1080 };

    console.log(`📱 Viewport: ${viewPort} (${viewportConfig.width}x${viewportConfig.height})`);
    console.log(`🎯 Analysis Type: ${analysisType}`);
    console.log(`🤖 AI Provider: ${aiProvider.type.toUpperCase()}`);

    if (isDemoMode) {
        console.log(`🎭 DEMO MODE: Sample analysis will be provided. Add your API key for real AI insights!`);
    } else if (isFreeMode) {
        console.log(`🎁 FREE TIER MODE: Using your API key with generous free limits`);
    }

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

            // Check free tier limit
            if (isFreeMode && !usageTracker.canProcess()) {
                log.warning(`⚠️ FREE TIER LIMIT REACHED (${FREE_TIER_DAILY_LIMIT} audits per day)`);
                await Actor.pushData({
                    url,
                    status: 'LIMIT_REACHED',
                    message: `Free tier limit reached (${FREE_TIER_DAILY_LIMIT} audits per day). Please provide your own API key for unlimited audits.`,
                    audit_date: new Date().toISOString()
                });
                return;
            }

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
                    if (aiProvider.type === 'demo') {
                        // Demo mode - return sample analysis
                        log.info('🎭 Generating demo analysis...');
                        aiResult = getDemoAnalysis(analysisType, url);
                    } else if (aiProvider.type === 'openai' || aiProvider.type === 'openrouter') {
                        aiResult = await analyzeWithOpenAI(
                            aiProvider.client,
                            screenshotBase64,
                            analysisType,
                            url,
                            aiProvider.model // Pass the model (e.g., 'gpt-4o' or 'google/gemini-...')
                        );
                    } else {
                        aiResult = await analyzeWithGemini(
                            aiProvider.client,
                            screenshotBase64,
                            analysisType,
                            url
                        );
                    }

                    // Increment usage counter for free tier (not for demo mode)
                    if (isFreeMode && aiProvider.type !== 'demo') {
                        usageTracker.increment();
                        log.info(`📊 Free tier usage: ${usageTracker.count}/${FREE_TIER_DAILY_LIMIT}`);
                    }

                } catch (apiError) {
                    log.error(`❌ AI Analysis failed: ${apiError.message}`);

                    // Check for specific error types
                    if (apiError.message?.includes('401') || apiError.message?.includes('authentication')) {
                        throw new Error('Invalid API Key provided. Please check your OpenAI, OpenRouter, or Gemini API key.');
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
                    free_tier_remaining: isFreeMode ? usageTracker.getRemaining() : null
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

    if (isDemoMode) {
        console.log(`🎭 Demo mode completed. Provide your API key for real AI-powered analysis!`);
    } else if (isFreeMode) {
        console.log(`📊 Analysis completed using your API key`);
    }
});
