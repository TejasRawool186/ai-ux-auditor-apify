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

// Performance analysis function
async function analyzePerformance(page) {
    const performance = {
        page_load_time: 0,
        page_size_mb: 0,
        image_count: 0,
        external_links_count: 0,
        internal_links_count: 0,
        form_count: 0,
        button_count: 0,
        script_count: 0,
        stylesheet_count: 0,
        performance_score: 0
    };

    try {
        const perfData = await page.evaluate(() => {
            const data = {
                imageCount: document.querySelectorAll('img').length,
                externalLinks: 0,
                internalLinks: 0,
                formCount: document.querySelectorAll('form').length,
                buttonCount: document.querySelectorAll('button, input[type="button"], input[type="submit"]').length,
                scriptCount: document.querySelectorAll('script').length,
                stylesheetCount: document.querySelectorAll('link[rel="stylesheet"]').length
            };

            // Count internal vs external links
            const links = document.querySelectorAll('a[href]');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                    data.externalLinks++;
                } else if (href.startsWith('/') || href.includes(window.location.hostname)) {
                    data.internalLinks++;
                }
            });

            return data;
        });

        Object.assign(performance, perfData);
        
        // Calculate performance score based on metrics
        let score = 10;
        if (performance.image_count > 50) score -= 2;
        if (performance.script_count > 20) score -= 1;
        if (performance.stylesheet_count > 10) score -= 1;
        performance.performance_score = Math.max(1, score);

    } catch (error) {
        console.log(`⚠️ Performance analysis failed: ${error.message}`);
    }

    return performance;
}

// Accessibility analysis function
async function analyzeAccessibility(page) {
    const accessibility = {
        accessibility_score: 0,
        wcag_violations: [],
        keyboard_navigation_score: 0,
        screen_reader_compatibility: 0,
        color_blind_friendly: true,
        font_size_compliance: true,
        alt_text_missing: 0,
        heading_structure_score: 0,
        form_labels_score: 0,
        contrast_issues: 0
    };

    try {
        const a11yData = await page.evaluate(() => {
            const data = {
                imagesWithoutAlt: 0,
                headingStructure: [],
                formsWithoutLabels: 0,
                focusableElements: 0,
                ariaLabels: 0
            };

            // Check images without alt text
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (!img.getAttribute('alt')) {
                    data.imagesWithoutAlt++;
                }
            });

            // Check heading structure
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(heading => {
                data.headingStructure.push(heading.tagName);
            });

            // Check forms without labels
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                const label = document.querySelector(`label[for="${input.id}"]`);
                const ariaLabel = input.getAttribute('aria-label');
                if (!label && !ariaLabel) {
                    data.formsWithoutLabels++;
                }
            });

            // Count focusable elements
            data.focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]').length;

            // Count aria labels
            data.ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]').length;

            return data;
        });

        accessibility.alt_text_missing = a11yData.imagesWithoutAlt;
        accessibility.form_labels_score = Math.max(1, 10 - a11yData.formsWithoutLabels);
        accessibility.heading_structure_score = a11yData.headingStructure.length > 0 ? 8 : 3;

        // Calculate overall accessibility score
        let score = 10;
        if (a11yData.imagesWithoutAlt > 0) score -= 2;
        if (a11yData.formsWithoutLabels > 0) score -= 2;
        if (a11yData.headingStructure.length === 0) score -= 1;
        accessibility.accessibility_score = Math.max(1, score);

        // Add violations based on findings
        if (a11yData.imagesWithoutAlt > 0) {
            accessibility.wcag_violations.push('missing-alt-text');
        }
        if (a11yData.formsWithoutLabels > 0) {
            accessibility.wcag_violations.push('unlabeled-form-controls');
        }

    } catch (error) {
        console.log(`⚠️ Accessibility analysis failed: ${error.message}`);
    }

    return accessibility;
}

// Mobile responsiveness analysis
async function analyzeMobileResponsiveness(page) {
    const mobile = {
        mobile_score: 0,
        responsive_breakpoints: [],
        touch_target_compliance: 0,
        mobile_navigation_type: null,
        viewport_meta_present: false,
        mobile_specific_issues: []
    };

    try {
        const mobileData = await page.evaluate(() => {
            const data = {
                viewportMeta: !!document.querySelector('meta[name="viewport"]'),
                smallButtons: 0,
                navigationStyle: null
            };

            // Check for small touch targets
            const buttons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
            buttons.forEach(btn => {
                const rect = btn.getBoundingClientRect();
                if (rect.width < 44 || rect.height < 44) {
                    data.smallButtons++;
                }
            });

            // Detect navigation style
            const hamburger = document.querySelector('.hamburger, .menu-toggle, [class*="mobile-menu"]');
            const drawer = document.querySelector('.drawer, .sidebar, [class*="nav-drawer"]');
            if (hamburger || drawer) {
                data.navigationStyle = 'hamburger';
            } else {
                data.navigationStyle = 'standard';
            }

            return data;
        });

        mobile.viewport_meta_present = mobileData.viewportMeta;
        mobile.mobile_navigation_type = mobileData.navigationStyle;
        mobile.touch_target_compliance = Math.max(1, 10 - mobileData.smallButtons);

        // Calculate mobile score
        let score = 10;
        if (!mobileData.viewportMeta) score -= 3;
        if (mobileData.smallButtons > 5) score -= 2;
        mobile.mobile_score = Math.max(1, score);

        if (mobileData.smallButtons > 0) {
            mobile.mobile_specific_issues.push(`${mobileData.smallButtons} touch targets smaller than 44px`);
        }

    } catch (error) {
        console.log(`⚠️ Mobile analysis failed: ${error.message}`);
    }

    return mobile;
}

// SEO analysis function
async function analyzeSEO(page) {
    const seo = {
        seo_score: 0,
        meta_title: null,
        meta_description: null,
        h1_tags: [],
        h2_tags: [],
        missing_meta_tags: [],
        structured_data_present: false,
        image_alt_optimization: 0,
        internal_links_count: 0,
        external_links_count: 0
    };

    try {
        const seoData = await page.evaluate(() => {
            const data = {
                title: document.querySelector('title')?.textContent || null,
                description: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
                h1Tags: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
                h2Tags: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
                structuredData: !!document.querySelector('script[type="application/ld+json"]'),
                imagesWithAlt: document.querySelectorAll('img[alt]').length,
                totalImages: document.querySelectorAll('img').length
            };

            return data;
        });

        seo.meta_title = seoData.title;
        seo.meta_description = seoData.description;
        seo.h1_tags = seoData.h1Tags;
        seo.h2_tags = seoData.h2Tags;
        seo.structured_data_present = seoData.structuredData;
        seo.image_alt_optimization = seoData.totalImages > 0 ? 
            Math.round((seoData.imagesWithAlt / seoData.totalImages) * 100) : 100;

        // Check for missing meta tags
        if (!seoData.title) seo.missing_meta_tags.push('title');
        if (!seoData.description) seo.missing_meta_tags.push('meta-description');

        // Calculate SEO score
        let score = 10;
        if (!seoData.title) score -= 3;
        if (!seoData.description) score -= 2;
        if (seoData.h1Tags.length === 0) score -= 2;
        if (seo.image_alt_optimization < 80) score -= 1;
        seo.seo_score = Math.max(1, score);

    } catch (error) {
        console.log(`⚠️ SEO analysis failed: ${error.message}`);
    }

    return seo;
}

// Content analysis function
async function analyzeContent(page) {
    const content = {
        content_score: 0,
        word_count: 0,
        paragraph_count: 0,
        heading_count: 0,
        call_to_action_count: 0,
        social_proof_elements: [],
        readability_score: 0,
        content_structure_score: 0
    };

    try {
        const contentData = await page.evaluate(() => {
            const data = {
                textContent: document.body.textContent || '',
                paragraphs: document.querySelectorAll('p').length,
                headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
                ctaButtons: 0,
                socialProof: []
            };

            // Count CTA buttons
            const ctaSelectors = [
                'button', 'a[href*="signup"]', 'a[href*="register"]', 
                'a[href*="buy"]', 'a[href*="purchase"]', '[class*="cta"]',
                '[class*="button"]', 'input[type="submit"]'
            ];
            ctaSelectors.forEach(selector => {
                data.ctaButtons += document.querySelectorAll(selector).length;
            });

            // Detect social proof elements
            if (document.querySelector('[class*="testimonial"]')) {
                data.socialProof.push('testimonials');
            }
            if (document.querySelector('[class*="review"]')) {
                data.socialProof.push('reviews');
            }
            if (document.querySelector('[class*="logo"], [class*="client"]')) {
                data.socialProof.push('client-logos');
            }
            if (document.querySelector('[class*="rating"], [class*="star"]')) {
                data.socialProof.push('ratings');
            }

            return data;
        });

        const words = contentData.textContent.split(/\s+/).filter(word => word.length > 0);
        content.word_count = words.length;
        content.paragraph_count = contentData.paragraphs;
        content.heading_count = contentData.headings;
        content.call_to_action_count = contentData.ctaButtons;
        content.social_proof_elements = contentData.socialProof;

        // Calculate content scores
        content.readability_score = Math.min(10, Math.max(1, Math.round(content.word_count / 100)));
        content.content_structure_score = Math.min(10, content.heading_count + content.paragraph_count);
        
        let score = 5;
        if (content.word_count > 300) score += 2;
        if (content.heading_count > 3) score += 1;
        if (content.call_to_action_count > 0) score += 1;
        if (content.social_proof_elements.length > 0) score += 1;
        content.content_score = Math.min(10, score);

    } catch (error) {
        console.log(`⚠️ Content analysis failed: ${error.message}`);
    }

    return content;
}

// Conversion optimization analysis
async function analyzeConversion(page) {
    const conversion = {
        conversion_score: 0,
        cta_visibility_score: 0,
        trust_signals: [],
        friction_points: [],
        value_proposition_clarity: 0,
        urgency_elements: [],
        social_proof_score: 0,
        form_optimization_score: 0
    };

    try {
        const conversionData = await page.evaluate(() => {
            const data = {
                ctaButtons: document.querySelectorAll('button, [class*="cta"], [class*="button"]').length,
                forms: document.querySelectorAll('form').length,
                trustSignals: [],
                urgencyElements: [],
                frictionPoints: []
            };

            // Detect trust signals
            if (document.querySelector('[class*="ssl"], [class*="secure"]')) {
                data.trustSignals.push('ssl-certificate');
            }
            if (document.querySelector('[class*="testimonial"]')) {
                data.trustSignals.push('testimonials');
            }
            if (document.querySelector('[class*="guarantee"], [class*="warranty"]')) {
                data.trustSignals.push('guarantee');
            }
            if (document.querySelector('[class*="badge"], [class*="award"]')) {
                data.trustSignals.push('awards');
            }

            // Detect urgency elements
            const urgencyText = document.body.textContent.toLowerCase();
            if (urgencyText.includes('limited time') || urgencyText.includes('expires')) {
                data.urgencyElements.push('limited-time-offer');
            }
            if (urgencyText.includes('only') && urgencyText.includes('left')) {
                data.urgencyElements.push('scarcity');
            }
            if (urgencyText.includes('today only') || urgencyText.includes('24 hours')) {
                data.urgencyElements.push('time-sensitive');
            }

            // Detect friction points
            const requiredFields = document.querySelectorAll('input[required]').length;
            if (requiredFields > 5) {
                data.frictionPoints.push('too-many-required-fields');
            }
            if (document.querySelector('input[type="password"]') && !document.querySelector('[class*="signup"], [class*="register"]')) {
                data.frictionPoints.push('login-required');
            }

            return data;
        });

        conversion.trust_signals = conversionData.trustSignals;
        conversion.urgency_elements = conversionData.urgencyElements;
        conversion.friction_points = conversionData.frictionPoints;
        
        conversion.cta_visibility_score = Math.min(10, conversionData.ctaButtons * 2);
        conversion.social_proof_score = Math.min(10, conversionData.trustSignals.length * 2);
        conversion.form_optimization_score = conversionData.forms > 0 ? 
            Math.max(1, 10 - conversionData.frictionPoints.length * 2) : 10;

        // Calculate overall conversion score
        let score = 5;
        score += Math.min(2, conversionData.ctaButtons);
        score += Math.min(2, conversionData.trustSignals.length);
        score += Math.min(1, conversionData.urgencyElements.length);
        score -= conversionData.frictionPoints.length;
        conversion.conversion_score = Math.max(1, Math.min(10, score));

    } catch (error) {
        console.log(`⚠️ Conversion analysis failed: ${error.message}`);
    }

    return conversion;
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

                // Comprehensive website analysis
                log.info('🔍 Detecting technologies...');
                const technologies = await detectTechnologies(page);
                
                log.info('⚡ Analyzing performance metrics...');
                const performance = await analyzePerformance(page);
                
                log.info('♿ Checking accessibility...');
                const accessibility = await analyzeAccessibility(page);
                
                log.info('📱 Testing mobile responsiveness...');
                const mobile = await analyzeMobileResponsiveness(page);
                
                log.info('🔍 Analyzing SEO elements...');
                const seo = await analyzeSEO(page);
                
                log.info('📝 Examining content quality...');
                const content = await analyzeContent(page);
                
                log.info('💰 Evaluating conversion optimization...');
                const conversion = await analyzeConversion(page);

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

                // Create a flattened version for vertical display
                const flattenedResult = {
                    'Website URL': url,
                    'Audit Date': new Date().toISOString(),
                    'Analysis Type': analysisType,
                    'Viewport': viewPort,
                    'AI Provider': aiProvider.type,
                    
                    // Scores
                    '⭐ Overall UX Score': aiResult.score || 0,
                    '⚡ Performance Score': performance.performance_score,
                    '♿ Accessibility Score': accessibility.accessibility_score,
                    '📱 Mobile Score': mobile.mobile_score,
                    '🔍 SEO Score': seo.seo_score,
                    '📝 Content Score': content.content_score,
                    '💰 Conversion Score': conversion.conversion_score,
                    
                    // AI Analysis
                    '📝 AI Summary': aiResult.summary || 'No summary available',
                    '🎨 Color Palette': (aiResult.color_palette || []).join(', '),
                    '⚠️ Design Issues': (aiResult.design_flaws || []).join(' | '),
                    '✅ Positive Aspects': (aiResult.positive_aspects || []).join(' | '),
                    '💡 AI Recommendations': (aiResult.recommendations || []).join(' | '),
                    
                    // Technology
                    '⚛️ Frontend Framework': technologies.frontend_framework || 'Not detected',
                    '🎨 CSS Framework': technologies.css_framework || 'Not detected',
                    '📄 CMS Platform': technologies.cms || 'Not detected',
                    '🛒 E-commerce Platform': technologies.ecommerce || 'Not detected',
                    '📊 Analytics Tools': technologies.analytics.join(', ') || 'None detected',
                    
                    // Performance
                    '🖼️ Image Count': performance.image_count,
                    '🔘 Button Count': performance.button_count,
                    '📝 Form Count': performance.form_count,
                    '📜 Script Count': performance.script_count,
                    
                    // Accessibility
                    '⚠️ Missing Alt Text': accessibility.alt_text_missing,
                    '🚫 WCAG Violations': accessibility.wcag_violations.join(', ') || 'None found',
                    '📋 Form Labels Score': accessibility.form_labels_score,
                    
                    // Mobile
                    '👆 Touch Target Score': mobile.touch_target_compliance,
                    '📱 Viewport Meta Present': mobile.viewport_meta_present ? 'Yes' : 'No',
                    '🍔 Navigation Type': mobile.mobile_navigation_type || 'Standard',
                    
                    // SEO
                    '📄 Meta Title': seo.meta_title || 'Missing',
                    '📝 Meta Description': seo.meta_description || 'Missing',
                    '📰 H1 Tags': seo.h1_tags.join(', ') || 'None found',
                    '🖼️ Image Alt Optimization': `${seo.image_alt_optimization}%`,
                    
                    // Content
                    '📊 Word Count': content.word_count,
                    '📢 CTA Count': content.call_to_action_count,
                    '🏆 Social Proof Elements': content.social_proof_elements.join(', ') || 'None detected',
                    
                    // Conversion
                    '🛡️ Trust Signals': conversion.trust_signals.join(', ') || 'None detected',
                    '⚠️ Friction Points': conversion.friction_points.join(', ') || 'None detected',
                    '🎯 CTA Visibility Score': conversion.cta_visibility_score,
                    
                    // Screenshot
                    '📸 Screenshot URL': screenshotUrl
                };

                // Construct comprehensive final result
                const auditResult = {
                    // Basic Info
                    url,
                    audit_date: new Date().toISOString(),
                    analysis_type: analysisType,
                    viewport: viewPort,
                    ai_provider: aiProvider.type,
                    
                    // AI Analysis Results
                    overall_score: aiResult.score || 0,
                    ai_summary: aiResult.summary || 'No summary available',
                    color_palette: aiResult.color_palette || [],
                    design_flaws: aiResult.design_flaws || [],
                    positive_aspects: aiResult.positive_aspects || [],
                    ai_recommendations: aiResult.recommendations || [],
                    
                    // Technology Stack
                    technology_stack: technologies,
                    
                    // Performance Metrics
                    performance_metrics: performance,
                    
                    // Accessibility Analysis
                    accessibility_analysis: accessibility,
                    
                    // Mobile Responsiveness
                    mobile_analysis: mobile,
                    
                    // SEO Analysis
                    seo_analysis: seo,
                    
                    // Content Analysis
                    content_analysis: content,
                    
                    // Conversion Optimization
                    conversion_analysis: conversion,
                    
                    // Comprehensive Scores
                    scores: {
                        overall_ux: aiResult.score || 0,
                        performance: performance.performance_score,
                        accessibility: accessibility.accessibility_score,
                        mobile: mobile.mobile_score,
                        seo: seo.seo_score,
                        content: content.content_score,
                        conversion: conversion.conversion_score
                    },
                    
                    // Screenshot
                    screenshot_url: screenshotUrl
                };

                // Save both comprehensive and flattened results to dataset
                await Actor.pushData(auditResult);
                await Actor.pushData({
                    ...flattenedResult,
                    _type: 'flattened_report' // Add type identifier
                });
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
