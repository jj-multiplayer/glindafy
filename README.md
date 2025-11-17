# Glindafy Chrome Extension

AI-powered Chrome extension that transforms web pages with a fabulous pink Glinda the Good Witch aesthetic using Gemini AI for both image transformation and style analysis.

## Features

- ✨ **AI-Powered Style Analysis**: Uses Gemini AI to analyze page structure and generate customized pink theme CSS
- 🎨 **Pink Theme Transformation**: Automatically applies a magical pink color scheme with gradients and sparkles
- 🖼️ **Image Transformation**: Uses Gemini AI to transform existing images with a Glinda glow-up aesthetic
- 🔄 **Automatic Activation**: Runs automatically on page load
- 💾 **Secure Storage**: API keys stored securely in Chrome storage
- 🏗️ **Modular Architecture**: Clean, organized code with ES6 modules

## Setup

### 1. Clone and Load Extension

- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select this directory

### 2. Configure API Key

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

Edit `service-worker.js` and replace the API key on line 3:

```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_KEY_HERE';
```

## File Structure

```
glindafy/
├── manifest.json          # Extension manifest with ES6 module support
├── content.js             # Main content script (all functionality bundled)
└── service-worker.js      # Background service worker for API calls
```

## Architecture

### Module Organization

**content.js** (Single bundled file with organized modules)
- GLINDA_CONSTANTS: Configuration values, colors, timing
- GlindaShared: Image base64 conversion utilities
- GlindaUI: Notification system and stylesheet injection
- GlindaTheme: AI-powered style analysis and theme application
- GlindaImageTransformer: Image filtering, validation, and transformation
- Main orchestration: Coordinates theme and image transformation

**service-worker.js** (ES6 module for background tasks)
- Handles all Gemini API communication
- Manages retry logic and rate limiting
- Processes image transformations and style analysis
- Error handling and response parsing

## How It Works

### Style Transformation

1. Analyzes page HTML and CSS using Gemini AI
2. Generates customized pink theme CSS
3. Falls back to default pink theme if AI analysis fails

### Image Transformation

1. Finds all images on the page (minimum 32x32 pixels)
2. Converts images to base64
3. Sends to Gemini AI with original image and Glinda aesthetic prompt
4. Replaces original images with transformed versions
5. Shows progress notifications

## Permissions

- `activeTab`: To access and modify the current tab
- `scripting`: To inject content scripts
- `storage`: Reserved for future features
- `host_permissions`: Access to Gemini API

## Security

- ✅ API key configured in service worker (not exposed to page context)
- ✅ All API calls made from secure service worker context
- ✅ Content scripts isolated from service worker
- ⚠️ Keep your `service-worker.js` file secure and don't commit API keys to public repos

## Performance & Free Tier Limits

According to [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits#free-tier), the free tier has strict quotas:

**Free Tier Limits:**
- 10 requests per minute (RPM)
- 100 requests per day (RPD)
- Uses `gemini-2.0-flash-exp` model

**Extension Optimizations:**
- Automatic rate limit tracking and enforcement
- Processes only the first image on each page (>200px)
- Daily request counter resets at midnight
- Intelligent wait times when approaching limits
- Images smaller than 200x200 pixels automatically skipped
- Already transformed images detected and skipped
- Maximum 3 retry attempts to conserve quota

## Development

### Code Standards

- ES6+ modules throughout
- Pure functions where possible
- Minimal side effects
- Descriptive naming conventions
- Centralized constants
- No code comments (self-documenting code)
- Minimal use of CSS `!important`

### Extending

To add new features:

1. Add constants to the GLINDA_CONSTANTS object in `content.js`
2. Create new module objects (e.g., GlindaNewFeature) in `content.js`
3. Add new API handlers in `service-worker.js` if needed
4. Update the main orchestration function to call new features

## Troubleshooting

**Extension not working?**
- Check that API key is set in `service-worker.js`
- Open DevTools Console to see error messages
- Verify you have an active internet connection
- Check Chrome Extensions page for any errors

**Images not transforming?**
- Check API key is valid in `service-worker.js`
- **Free tier limits**: 10 requests/min, 100 requests/day
- Check console for rate limit messages
- Wait if you see "Daily limit reached" (resets at midnight PT)
- Extension will automatically pace requests to stay within limits

**Styles not applying?**
- Some websites may have very strong CSS specificity
- Try refreshing the page
- Check that content script loaded successfully
