# ✨ Glindafy ✨

*Are you a good witch, or a wicked witch?* Either way, darling, you're about to make the internet absolutely **fabulous**! 

Glindafy is a magical Chrome extension that transforms any webpage into a dreamy pink paradise worthy of Glinda the Good Witch herself. With the power of Gemini AI, we sprinkle sparkles, add ethereal beauty, and give everything that enchanting pink glow you've been dreaming of. ✨

## 🎀 What Makes This So Fabulous?

- ✨ **AI-Powered Magic**: Gemini AI works its spellbinding magic to transform your images with a Glinda glow-up aesthetic
- 🎨 **Pink Theme Enchantment**: Automatically bathes every page in dreamy pink gradients, magical sparkles, and ethereal vibes
- 🖼️ **Image Transformation**: Your photos get the full Glinda treatment - pink palettes, sparkle effects, and that fabulous fantasy aesthetic
- 🔄 **Automatic Sparkle**: Just visit a page and watch the magic happen - no wand-waving required!
- 💎 **CORS-Free Sorcery**: Fetches images from any domain without those pesky CORS restrictions
- 👁️ **Smart Image Detection**: Automatically finds and transforms the most visible, fabulous images on the page

## 🪄 Getting Started (The Fabulous Way)

### Step 1: Summon the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (because you're a developer, darling!)
3. Click "Load unpacked" and select this magical directory

### Step 2: Add Your API Key (The Secret Ingredient)

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey) - it's free and fabulous!

Edit `service-worker.js` and replace the API key on line 3:

```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_KEY_HERE';
```

*Keep this key safe, sweetie - it's your ticket to all this magic!*

## 📁 The Magical Structure

```
glindafy/
├── manifest.json          # The spellbook that makes it all work
├── content.js             # Where the real magic happens
├── service-worker.js      # The behind-the-scenes wizardry
└── assets/               # Custom cursors and icons (because details matter!)
```

## 🎭 How the Magic Works

### The Pink Theme Spell

1. The extension casts a pink gradient overlay across the entire page
2. Custom magical cursors appear (because even your pointer should be fabulous)
3. Everything gets a dreamy pink and lavender color palette
4. Sparkles and enchantment everywhere you look!

### The Image Transformation Spell

1. Finds the most visible, fabulous images on the page (skips those hidden inspection images - we're not interested in those!)
2. Converts them to base64 through our CORS-free service worker
3. Sends them to Gemini AI with our special Glinda prompt
4. Replaces the original images with their sparkly, pink-transformed versions
5. Shows you delightful notifications so you know the magic is working

## 🔐 Security & Privacy (Because We're Good Witches)

- ✅ API key stays safely in the service worker (never exposed to page context)
- ✅ All API calls happen in a secure service worker context
- ✅ Content scripts are properly isolated
- ⚠️ **Important**: Don't commit your API key to public repos - keep your secrets secret!

## ⚡ Performance & Rate Limits

According to [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits#free-tier), the free tier has some limits:

**Free Tier Limits:**
- 10 requests per minute (RPM)
- 100 requests per day (RPD)
- Uses `gemini-2.5-flash-image` model

**Our Fabulous Optimizations:**
- ✨ Automatic rate limit tracking (we're smart like that)
- ✨ Processes the largest visible image on each page (>200px)
- ✨ Daily counter resets at midnight (like Cinderella, but with API limits)
- ✨ Intelligent wait times when approaching limits
- ✨ Skips tiny images automatically (we only work with the best!)
- ✨ Detects already-transformed images (no double-sparkling needed)
- ✨ Maximum 3 retry attempts (because persistence is fabulous)

## 🛠️ For the Developers (The Wicked Smart Ones)

### Code Standards

- ES6+ modules throughout (modern magic!)
- Pure functions where possible (clean spells)
- Minimal side effects (controlled chaos)
- Descriptive naming conventions (self-documenting enchantments)
- Centralized constants (organized magic)
- No code comments (the code speaks for itself, darling!)

### Adding Your Own Magic

Want to extend the fabulousness?

1. Add constants to the `GLINDA_CONSTANTS` object in `content.js`
2. Create new module objects (e.g., `GlindaNewFeature`) in `content.js`
3. Add new API handlers in `service-worker.js` if needed
4. Update the main orchestration function to call your new features

## 🆘 Troubleshooting (When Magic Goes Wrong)

**Extension not working?**
- Check that your API key is set in `service-worker.js` (it's the secret ingredient!)
- Open DevTools Console to see what's happening (even magic has logs)
- Verify you have an active internet connection (magic needs WiFi, darling)
- Check Chrome Extensions page for any errors

**Images not transforming?**
- Check that your API key is valid in `service-worker.js`
- **Free tier limits**: 10 requests/min, 100 requests/day (we're working within limits!)
- Check console for rate limit messages
- Wait if you see "Daily limit reached" (resets at midnight - patience is a virtue!)
- The extension automatically paces requests to stay within limits

**Styles not applying?**
- Some websites have very strong CSS specificity (they're fighting our magic!)
- Try refreshing the page (sometimes you need to cast the spell twice)
- Check that content script loaded successfully

**CORS issues?**
- Fear not! We've solved this with our service worker magic
- Images from any domain should work now (we're that good!)

## 💖 Final Thoughts

Remember, darling - being fabulous isn't just about the pink sparkles and magical transformations. It's about bringing a little bit of Glinda's goodness (or wickedness, your choice!) to everything you do online. 

Now go forth and make the internet absolutely **fabulous**! ✨🎀💖

*Are you a good witch, or a wicked one?*
