document.addEventListener('DOMContentLoaded', async () => {
  const exportBtn = document.getElementById('exportBtn');
  const status = document.getElementById('status');

  // Check if we're on a Notion page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url || !tab.url.includes('notion.site')) {
    showStatus('This extension only works on Notion pages', 'error');
    exportBtn.disabled = true;
    return;
  }

  exportBtn.addEventListener('click', async () => {
    try {
      exportBtn.disabled = true;
      exportBtn.textContent = 'Extracting...';
      showStatus('Analyzing page content...', 'info');

      // First, inject the content script if not already injected
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Then execute the extraction
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractNotionContent,
      });

      if (result.result.success) {
        showStatus('Markdown file downloaded successfully!', 'success');
        exportBtn.textContent = 'Export Complete ✓';
        
        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        throw new Error(result.result.error || 'Failed to extract content');
      }
    } catch (error) {
      console.error('Export failed:', error);
      showStatus(`Error: ${error.message}`, 'error');
      exportBtn.disabled = false;
      exportBtn.textContent = 'Export as Markdown';
    }
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
  }
});

// This function will be injected into the page
function extractNotionContent() {
  try {
    // Check if NotionContentExtractor is available
    if (typeof NotionContentExtractor === 'undefined') {
      throw new Error('NotionContentExtractor is not loaded properly');
    }

    const extractor = new NotionContentExtractor();
    const markdown = extractor.extractToMarkdown();
    
    if (markdown.trim()) {
      // Create and trigger download
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = extractor.getPageTitle() + '.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, wordCount: markdown.split(/\s+/).length };
    } else {
      return { success: false, error: 'No content found on this page' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
} 