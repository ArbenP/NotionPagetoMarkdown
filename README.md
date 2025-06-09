# Notion to Markdown Chrome Extension

A Chrome extension that extracts content from public Notion pages and exports it as well-formatted Markdown files.

## Features

- 🎯 **One-click export** - Simply click the extension button while on any Notion page
- 📝 **Complete content extraction** - Captures titles, headings, paragraphs, code blocks, lists, and more
- 🎨 **Preserves formatting** - Maintains bold, italic, strikethrough, inline code, and link formatting
- 📊 **Multi-column support** - Handles Notion's column layouts intelligently
- 🔄 **Nested blocks** - Properly processes nested lists and toggle blocks
- 🚫 **Noise filtering** - Ignores navigation bars, buttons, and other non-content elements
- 💾 **Auto-download** - Automatically downloads the `.md` file with the page title as filename
- ⚡ **Client-side only** - No server dependencies, works entirely in your browser

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar

## Usage

1. Navigate to any public Notion page (e.g., `https://yoursite.notion.site/page-title`)
2. Click the extension icon in your Chrome toolbar
3. Click the "Export as Markdown" button in the popup
4. The extension will analyze the page and automatically download a `.md` file
5. The downloaded file will be named after the page title (e.g., `My-Notion-Page.md`)

## Supported Notion Elements

- ✅ Headers (H1, H2, H3, H4, H5, H6)
- ✅ Paragraphs with inline formatting
- ✅ Bold, italic, strikethrough text
- ✅ Inline code and code blocks
- ✅ Bulleted and numbered lists (with nesting)
- ✅ Blockquotes
- ✅ Links
- ✅ Toggle blocks (converted to HTML details/summary)
- ✅ Multi-column layouts
- ✅ Nested content blocks
`

## Technical Details

- **Permissions**: Requires `activeTab` and `scripting` permissions
- **Manifest Version**: 3 
- **No external dependencies**: Vanilla JavaScript
- **Content Security Policy**: Compliant with Chrome's security requirements

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic and user interaction
├── content.js            # Main content extraction logic
├── background.js         # Service worker for tab management
├── icons/                # Extension icons
└── README.md            # This file
```

## How It Works

1. **Content Detection**: The extension identifies Notion page elements using CSS selectors and data attributes
2. **DOM Parsing**: Traverses the page DOM to extract text content in logical reading order
3. **Format Conversion**: Converts Notion's HTML structure to standard Markdown syntax
4. **Cleanup**: Removes excessive whitespace and formats the output for readability
5. **Download**: Creates a blob and triggers an automatic download

## Limitations
- Some complex Notion blocks (databases, embeds) may not be fully supported
- Relies on Notion's current HTML structure (may need updates if Notion changes their DOM)

## Troubleshooting

### Extension doesn't appear to work
- Make sure you're on a `notion.site` URL
- Check that the page has finished loading completely
- Try refreshing the page and clicking the extension again

### Empty or incomplete export
- Some Notion pages use lazy loading - try scrolling through the entire page first
- Complex nested structures might need manual review
- Check the browser console for any error messages

### Filename issues
- Special characters in page titles are automatically sanitized
- Very long titles are truncated to 100 characters

## Development

To modify or extend the extension:

1. Edit the relevant files (`content.js` for extraction logic, `popup.js` for UI)
2. Reload the extension in `chrome://extensions/`
3. Test on various Notion pages to ensure compatibility

The main extraction logic is in the `NotionContentExtractor` class in `content.js`.

## License

This project is open source. Feel free to modify and distribute according to your needs.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests for:
- Bug fixes
- New Notion block type support
- UI improvements
- Performance optimizations 
- Anything else too