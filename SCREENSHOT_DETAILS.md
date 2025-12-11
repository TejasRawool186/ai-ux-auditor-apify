# Screenshot Output Details

## 📸 Screenshot Specifications

### Desktop Screenshots (1920x1080)
- **Format**: PNG (high quality)
- **Viewport**: 1920x1080 pixels
- **Capture**: Above-the-fold content only
- **File Size**: Typically 200KB - 2MB
- **Naming**: `SCREENSHOT_{request_id}.png`

### Mobile Screenshots (390x844)
- **Format**: PNG (high quality) 
- **Viewport**: 390x844 pixels (iPhone 14 size)
- **Capture**: Above-the-fold content only
- **File Size**: Typically 100KB - 1MB
- **Naming**: `SCREENSHOT_{request_id}.png`

## 🔗 Screenshot URLs

Screenshots are automatically saved to Apify Key-Value Store and accessible via:

```
https://api.apify.com/v2/key-value-stores/{STORE_ID}/records/{SCREENSHOT_KEY}
```

Example:
```
https://api.apify.com/v2/key-value-stores/abc123def456/records/SCREENSHOT_req_001.png
```

## 📊 What Screenshots Show

### Successful Captures Include:
- ✅ Full page header and navigation
- ✅ Hero section with main content
- ✅ Primary call-to-action buttons
- ✅ Above-the-fold content area
- ✅ Cookie consent dismissed (when possible)

### Potential Issues:
- ⚠️ Loading states if page loads slowly
- ⚠️ Cookie consent overlays (if auto-dismiss fails)
- ⚠️ Geo-blocking messages for restricted content
- ⚠️ CAPTCHA challenges on protected sites

## 🎯 AI Analysis Focus Areas

The AI analyzes these visual elements from screenshots:

### Design Elements
- Color schemes and palette extraction
- Typography and font choices
- Layout and spacing
- Visual hierarchy
- Brand consistency

### User Experience
- Navigation clarity
- Button placement and sizing
- Content organization
- Mobile responsiveness
- Accessibility indicators

### Conversion Optimization
- Call-to-action visibility
- Trust signals and badges
- Form design and placement
- Value proposition clarity
- Social proof elements