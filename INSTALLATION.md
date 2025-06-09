# Quick Installation Guide

## Step 1: Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **"Load unpacked"**
4. Select the folder containing these files
5. The extension should now appear in your extensions list

## Step 2: Add Icons (Optional but Recommended)

Create or download simple icons and place them in the `icons/` folder:

- **icon16.png** - 16x16 pixels (toolbar icon)
- **icon48.png** - 48x48 pixels (extension management)  
- **icon128.png** - 128x128 pixels (Chrome Web Store)
- **icon16-disabled.png** - 16x16 pixels, grayed out
- **icon48-disabled.png** - 48x48 pixels, grayed out
- **icon128-disabled.png** - 128x128 pixels, grayed out

💡 **Tip**: You can use simple colored squares or emoji-style icons for testing.

## Step 3: Test the Extension

1. Visit any public Notion page (e.g., `https://someone.notion.site/Page-Title-123`)
2. Click the extension icon in your Chrome toolbar
3. Click **"Export as Markdown"** in the popup
4. A `.md` file should automatically download

## Troubleshooting

### Extension not loading?
- Make sure all files are in the same folder
- Check that `manifest.json` is present and valid
- Look for error messages in the Extensions page

### Button not working?
- Ensure you're on a `notion.site` URL
- Check the browser console (F12) for error messages
- Try refreshing the page

### No download happening?
- Make sure Chrome allows downloads from extensions
- Check your Downloads folder
- Some browsers may block automatic downloads

## Next Steps

Once installed and working:
- Test on different types of Notion pages
- Try pages with complex layouts, lists, and formatting
- The extension works best on fully-loaded pages (scroll through long pages first)

## File Structure Check

Your extension folder should contain:
```
📁 Extension Folder/
├── 📄 manifest.json
├── 📄 popup.html  
├── 📄 popup.js
├── 📄 content.js
├── 📄 background.js
├── 📁 icons/ (optional)
│   ├── 🖼️ icon16.png
│   ├── 🖼️ icon48.png  
│   └── 🖼️ icon128.png
└── 📄 README.md
```

Ready to export some Notion pages! 🚀 