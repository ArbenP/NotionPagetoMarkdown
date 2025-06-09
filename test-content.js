// Test file to demonstrate the Notion content extraction functionality
// This can be run in the browser console on any Notion page

// Mock test data that simulates a Notion page structure
function createTestNotionPage() {
  const testHTML = `
    <div class="notion-page-content">
      <div data-block-id="title-block">
        <h1>Sample Notion Page</h1>
      </div>
      
      <div data-block-id="text-block-1">
        <div data-content-editable-leaf="true">
          This is a paragraph with <strong>bold text</strong>, <em>italic text</em>, and <code>inline code</code>.
        </div>
      </div>
      
      <div data-block-id="header-block-1" class="notion-header-block notion-h2-block">
        <h2>Section Header</h2>
      </div>
      
      <div data-block-id="list-block-1" class="notion-bulleted-list-block">
        <div data-content-editable-leaf="true">First bullet point</div>
      </div>
      
      <div data-block-id="list-block-2" class="notion-bulleted-list-block">
        <div data-content-editable-leaf="true">Second bullet point with <a href="https://example.com">a link</a></div>
      </div>
      
      <div data-block-id="quote-block-1" class="notion-quote-block">
        <div data-content-editable-leaf="true">This is a blockquote with important information.</div>
      </div>
      
      <div data-block-id="code-block-1" class="notion-code-block">
        <code>console.log("Hello, World!");
function greet(name) {
  return \`Hello, \${name}!\`;
}</code>
      </div>
      
      <div data-block-id="numbered-list-1" class="notion-numbered-list-block">
        <div data-content-editable-leaf="true">First numbered item</div>
      </div>
      
      <div data-block-id="numbered-list-2" class="notion-numbered-list-block">
        <div data-content-editable-leaf="true">Second numbered item</div>
      </div>
    </div>
  `;
  
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = testHTML;
  return container;
}

// Test function to verify the extraction works
function testExtraction() {
  console.log('🧪 Testing Notion Content Extraction...');
  
  try {
    // Create test content
    const testContainer = createTestNotionPage();
    document.body.appendChild(testContainer);
    
    // Override the title for testing
    document.title = 'Test Notion Page - Notion';
    
    // Run the extractor
    const extractor = new NotionContentExtractor();
    const markdown = extractor.extractToMarkdown();
    
    console.log('✅ Extraction successful!');
    console.log('📄 Generated Markdown:');
    console.log('---');
    console.log(markdown);
    console.log('---');
    
    // Clean up
    document.body.removeChild(testContainer);
    
    return markdown;
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    return null;
  }
}

// Expected output for the test
const expectedMarkdown = `# Sample Notion Page

This is a paragraph with **bold text**, *italic text*, and \`inline code\`.

## Section Header

- First bullet point

- Second bullet point with [a link](https://example.com)

> This is a blockquote with important information.

\`\`\`
console.log("Hello, World!");
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

1. First numbered item
1. Second numbered item`;

// Instructions for testing
console.log(`
🔧 Notion to Markdown Extension - Test Mode

To test this extension:

1. Open any Notion page in your browser
2. Open the browser console (F12)
3. Paste the content of this file into the console
4. Run: testExtraction()

Or to test with the actual extension:

1. Load the extension in Chrome (Developer mode)
2. Visit any notion.site page  
3. Click the extension icon and "Export as Markdown"

The extension will automatically download a .md file with the page content.
`);

// Auto-run test if this file is loaded directly
if (typeof window !== 'undefined' && window.location.hostname.includes('notion')) {
  console.log('🚀 Auto-running test on Notion page...');
  // Wait a bit for the page to load
  setTimeout(() => {
    if (typeof NotionContentExtractor !== 'undefined') {
      testExtraction();
    } else {
      console.log('⚠️ NotionContentExtractor not found. Make sure content.js is loaded.');
    }
  }, 2000);
} 