# AI UI/UX Design Auditor

![AI UI/UX Design Auditor Banner](./hero-banner.png)

> **Turn Screenshots into Professional UX Audits in Seconds**  
> Powered by OpenAI GPT-4o Vision & Google Gemini AI

## 🎯 What is this?

The **AI UI/UX Design Auditor** is an Apify Actor that automatically analyzes websites using advanced AI vision technology. Simply provide URLs, and get comprehensive UI/UX audit reports with actionable insights, design scores, and professional recommendations.

Perfect for designers, developers, agencies, and product teams who want expert-level UX insights without the expert-level price tag.

---

## ✨ Features

- 🤖 **Dual AI Providers**: Supports both OpenAI GPT-4o Vision and Google Gemini
- 🎁 **Free Tier Available**: 5 free audits per day using our Gemini API (no credit card needed!)
- 🎨 **7 Analysis Types**: 
  - **General** - Overall aesthetics and usability
  - **Accessibility** - WCAG compliance and inclusive design
  - **Conversion** - CRO and sales funnel optimization
  - **Performance** - Visual performance indicators
  - **SEO** - On-page SEO elements analysis
  - **Mobile-First** - Mobile UX evaluation
  - **Brand Consistency** - Color palette and typography analysis
- 📱 **Desktop & Mobile Views**: Simulate different devices
- 📸 **Screenshot Capture**: High-quality PNG screenshots saved automatically
- 🎨 **Color Palette Extraction**: AI identifies your brand colors
- 📊 **Structured Data**: JSON output perfect for integration
- ⚡ **Fast & Concurrent**: Analyze multiple sites simultaneously

---

## 🚀 Quick Start

### 1. Add URLs to Analyze
Provide the websites you want to audit:
```json
[
  { "url": "https://yourwebsite.com" },
  { "url": "https://competitor.com" }
]
```

### 2. Choose Your Analysis Type
Select from 7 comprehensive audit modes:
- General UX evaluation
- Accessibility (WCAG) audit
- Conversion optimization review
- Performance analysis
- SEO content structure
- Mobile-first design check
- Brand consistency review

### 3. Pick Your Mode

**Option A: Free Tier** *(Recommended for getting started)*
- ✅ Enable "Use Free Tier"
- 🎁 Get 5 free audits per day
- 💳 No API key or credit card needed
- ⚡ Powered by Google Gemini

**Option B: Unlimited with Your API Key**
- Disable "Use Free Tier"
- Add your OpenAI (`sk-...`) or Google Gemini (`AIza...`) API key
- Get unlimited audits
- Costs: ~$0.01 per audit (OpenAI) or free (Gemini free tier)

### 4. Run & Get Results!
Your audit will include:
- **UX Score** (1-10)
- **Summary** of overall quality
- **Design Flaws** identified
- **Positive Aspects** highlighted
- **Recommendations** for improvement
- **Color Palette** extracted
- **Screenshot** saved for reference

---

## 📊 Sample Output

```json
{
  "url": "https://example.com",
  "audit_date": "2025-12-10T16:45:00.000Z",
  "analysis_type": "conversion",
  "viewport": "desktop",
  "ai_provider": "gemini",
  "score": 7.5,
  "summary": "Clean modern design with strong visual hierarchy. However, the primary CTA lacks contrast and trust signals are minimal.",
  "color_palette": [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFFFFF",
    "#2C3E50"
  ],
  "design_flaws": [
    "Call-to-action button has low color contrast (may fail WCAG AA)",
    "No visible trust badges or social proof above the fold",
    "Navigation menu items too small on mobile (< 44px touch targets)"
  ],
  "positive_aspects": [
    "Excellent use of whitespace creates breathing room",
    "Typography hierarchy is clear and scannable",
    "High-quality hero image with proper optimization"
  ],
  "recommendations": [
    "Increase CTA button contrast to at least 4.5:1 ratio",
    "Add trust signals (customer logos, testimonials) above the fold",
    "Implement larger touch targets for mobile navigation (min 44x44px)",
    "Consider A/B testing CTA copy for higher conversion"
  ],
  "screenshot_url": "https://api.apify.com/v2/key-value-stores/.../SCREENSHOT_xyz.png",
  "free_tier_remaining": 3
}
```

---

## 💰 Pricing & API Keys

### Free Tier (Recommended for Beginners)
- **Cost**: $0
- **Limit**: 5 audits per day
- **Setup**: Just enable "Use Free Tier" checkbox
- **AI Provider**: Google Gemini

### Bring Your Own API Key (Unlimited)

#### Option 1: OpenAI GPT-4o Vision
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key (starts with `sk-...`)
3. Add credits to your OpenAI account ($5-10 recommended)
4. **Cost**: ~$0.01 per website audit
5. Paste key into the "API Key" field

#### Option 2: Google Gemini
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a free API key (starts with `AIza...`)
3. **Cost**: FREE (with generous limits)
4. Paste key into the "API Key" field

> 💡 **Pro Tip**: Gemini API offers a free tier with 1,500 requests/day. Perfect for agencies analyzing multiple sites!

---

## 🎓 Use Cases

### For Designers
- Quickly audit competitors' websites
- Identify design inconsistencies in client projects
- Extract color palettes from inspiration sites
- Get objective UX feedback on your work

### For Developers
- Pre-launch UX quality checks
- Accessibility compliance scanning
- Performance optimization insights
- SEO content structure validation

### For Agencies
- Automated audit reports for proposals
- Client site reviews at scale
- Competitive analysis dashboards
- Quality assurance before handoff

### For Product Teams
- A/B test variant analysis
- Conversion funnel optimization
- Mobile-first design validation
- Brand consistency monitoring

---

## 🔧 Configuration Options

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| **Start URLs** | Array | Websites to audit | Required |
| **Use Free Tier** | Boolean | Enable free mode (5/day limit) | `true` |
| **API Key** | String | Your OpenAI/Gemini key | Optional |
| **Analysis Type** | Select | Audit focus area | `general` |
| **Viewport** | Select | Desktop or Mobile | `desktop` |
| **Proxy Config** | Object | Apify Proxy settings | Enabled |
| **Max Concurrency** | Number | Parallel audits (1-10) | `5` |

---

## 🛠️ Advanced Features

### Proxy Support
Built-in Apify Proxy support to:
- Avoid rate limiting
- Access geo-restricted sites
- Ensure consistent results

### Cookie Consent Handling
Automatically dismisses common cookie popups:
- GDPR consent banners
- Cookie acceptance dialogs
- Privacy policy overlays

### Screenshot Management
All screenshots automatically saved to Apify Key-Value Store with:
- Unique identifiers
- Direct access URLs
- PNG format (high quality)

---

## 📚 Technical Details

### Tech Stack
- **Runtime**: Node.js 20
- **Crawler**: Crawlee (PlaywrightCrawler)
- **Browser**: Playwright Chromium (headless)
- **AI**: OpenAI SDK + Google Generative AI SDK
- **Platform**: Apify

### Browser Automation
- Viewport simulation (desktop/mobile)
- Network idle wait (ensures full page load)
- Screenshot capture (above-the-fold)
- Cookie consent auto-dismiss

### AI Integration
- OpenAI GPT-4o Vision (1,500 token responses)
- Google Gemini 1.5 Flash (JSON structured output)
- Auto-detection of API key type
- Fallback to free tier if no key provided

---

## 🐛 Troubleshooting

### "Free tier limit reached"
➡️ You've used your 5 daily free audits. Options:
1. Wait 24 hours for reset
2. Add your own API key for unlimited use

### "Invalid API Key"
➡️ Check your API key format:
- OpenAI: starts with `sk-`
- Gemini: starts with `AIza`
- Ensure credits are available (OpenAI only)

### "Navigation timeout"
➡️ Website took too long to load. This is logged as a "FAILED" result in your dataset. Try:
- Checking if the website is accessible
- Enabling Apify Proxy
- Increasing timeout (requires code modification)

### "AI analysis failed"
➡️ Possible causes:
- API rate limits exceeded
- Invalid API credentials
- Network connectivity issues

---

## 📖 FAQ

**Q: How accurate are the AI audits?**  
A: The AI provides professional-level insights based on visual analysis. While not a replacement for human UX experts, it catches 80%+ of common issues and provides excellent directional guidance.

**Q: Can I analyze password-protected sites?**  
A: Not directly. You'll need to provide publicly accessible URLs or add authentication in the code.

**Q: How long does each audit take?**  
A: Typically 10-30 seconds per URL, depending on page load speed and AI provider response time.

**Q: Can I download the screenshots?**  
A: Yes! Screenshots are saved to Apify Key-Value Store. Use the `screenshot_url` from the dataset to download.

**Q: What's the difference between OpenAI and Gemini?**  
A: Both provide excellent results. Gemini is free (with limits) and faster. OpenAI GPT-4o Vision may provide slightly more detailed analysis but costs ~$0.01 per audit.

**Q: Is my data private?**  
A: When using free tier, screenshots are sent to Google Gemini API. When using your own key, data goes to your AI provider (OpenAI/Google). No data is stored by this actor beyond the audit results.

---

## 🎯 Apify $1M Challenge

This actor was built for the [Apify $1M Challenge](https://blog.apify.com/apify-1m-challenge/) with the goal of providing maximum utility to the developer and design community.

**Why it deserves to win:**
- ✅ Solves a real problem (expensive UX audits)
- ✅ Accessible to everyone (free tier available)
- ✅ Professional-quality output
- ✅ Multiple use cases (design, dev, marketing, product)
- ✅ Easy to use, hard to replicate value
- ✅ Scales with AI advancements

---

## 🤝 Support & Contributing

Found a bug? Have a feature request? Want to contribute?

- **GitHub**: [Report Issues](https://github.com/yourusername/ai-ux-auditor)
- **Email**: support@yourdomain.com
- **Discord**: Join our community

---

## 📝 License

MIT License - feel free to fork and customize!

---

## 🌟 Credits

Built with ❤️ by **Tejas Rawool**

Powered by:
- [Apify](https://apify.com) - Web scraping and automation platform
- [OpenAI](https://openai.com) - GPT-4o Vision API
- [Google AI](https://ai.google.dev) - Gemini Vision API
- [Crawlee](https://crawlee.dev) - Web crawling framework
- [Playwright](https://playwright.dev) - Browser automation

---

**Ready to transform your UX workflow?** [Start Analyzing →](https://console.apify.com/actors/your-actor-id)
