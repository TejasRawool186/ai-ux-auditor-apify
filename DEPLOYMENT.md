# Deployment Guide

## 🚀 Deploying to Apify Platform

### Prerequisites
- Apify account (free tier available)
- Git repository with your actor code

### Step 1: Prepare Your Code
```bash
# Verify build locally
npm run verify

# Test locally (optional)
npm test
```

### Step 2: Deploy via Apify Console

#### Option A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to [Apify Console](https://console.apify.com)
3. Click "Create Actor"
4. Select "Import from GitHub"
5. Connect your repository
6. Set build settings:
   - **Source type**: Git repository
   - **Git URL**: Your repository URL
   - **Branch**: main (or your preferred branch)
   - **Dockerfile**: `./Dockerfile`

#### Option B: Direct Upload
1. Create a ZIP file of your project (exclude node_modules)
2. Go to [Apify Console](https://console.apify.com)
3. Click "Create Actor"
4. Select "Upload ZIP file"
5. Upload your ZIP file

### Step 3: Configure Actor Settings
- **Name**: ai-ux-auditor
- **Title**: AI UI/UX Design Auditor
- **Description**: Copy from README.md
- **Categories**: TOOLS, AI, DEVELOPER_TOOLS
- **Input Schema**: Will be auto-detected from `.actor/input_schema.json`

### Step 4: Test Your Actor
1. Click "Try it" in the console
2. Add test URLs (e.g., https://example.com)
3. Enable "Use Free Tier"
4. Run the actor
5. Check results in the dataset

### Step 5: Publish (Optional)
1. Go to "Publication" tab
2. Add description, screenshots, and examples
3. Submit for review
4. Once approved, it will be available in Apify Store

## 🐛 Common Build Issues & Solutions

### Issue: "No input provided"
**Solution**: This is normal for local testing. The actor will use default input.

### Issue: "Invalid API Key"
**Solution**: 
- For free tier: Enable "Use Free Tier" checkbox
- For unlimited: Provide valid OpenAI (sk-...) or Gemini (AIza...) API key

### Issue: "Navigation timeout"
**Solution**: 
- Check if target websites are accessible
- Enable Apify Proxy in input configuration
- Some websites may block automated access

### Issue: "Memory limit exceeded"
**Solution**:
- Reduce maxConcurrency (try 1-3)
- Use smaller viewport sizes
- Process fewer URLs per run

### Issue: "Docker build failed"
**Solution**:
- Ensure all files are committed to Git
- Check Dockerfile syntax
- Verify package.json dependencies

## 📊 Performance Optimization

### For High Volume Usage
- Set maxConcurrency to 3-5
- Use Apify Proxy to avoid rate limiting
- Consider splitting large URL lists into batches

### For Cost Optimization
- Use free tier for testing (5 audits/day)
- Use Gemini API for unlimited free usage
- OpenAI costs ~$0.01 per audit

### For Speed Optimization
- Use desktop viewport (faster than mobile)
- Choose "general" analysis type (fastest)
- Enable Apify Proxy for better connectivity

## 🔒 Security Best Practices

### API Keys
- Never commit API keys to Git
- Use Apify's secret input fields
- Rotate keys regularly

### Proxy Usage
- Always use Apify Proxy for production
- Avoid analyzing sensitive/internal websites
- Respect robots.txt and rate limits

## 📈 Monitoring & Maintenance

### Key Metrics to Monitor
- Success rate (should be >90%)
- Average processing time per URL
- API costs (if using paid providers)
- Error patterns in logs

### Regular Maintenance
- Update dependencies monthly
- Monitor AI provider API changes
- Test with popular websites regularly
- Update analysis prompts based on feedback

## 🆘 Support

If you encounter issues:
1. Check the [troubleshooting section](README.md#troubleshooting) in README
2. Review actor logs in Apify Console
3. Test locally with `npm run verify`
4. Contact support with specific error messages

## 📝 Version History

- **v1.0**: Initial release with OpenAI and Gemini support
- **v1.1**: Added free tier and improved error handling
- **v1.2**: Enhanced mobile viewport and cookie handling

---

**Ready to deploy?** Follow the steps above and your AI UX Auditor will be live in minutes! 🚀