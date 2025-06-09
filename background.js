// Service Worker for the Notion to Markdown extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Notion to Markdown extension installed');
});

// Update extension icon based on current tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isNotionSite = tab.url.includes('notion.site');
    
    // Enable/disable extension based on whether we're on a Notion page
    chrome.action.setIcon({
      tabId: tabId,
      path: isNotionSite ? {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      } : {
        "16": "icons/icon16-disabled.png",
        "48": "icons/icon48-disabled.png", 
        "128": "icons/icon128-disabled.png"
      }
    });

    chrome.action.setTitle({
      tabId: tabId,
      title: isNotionSite ? 
        'Export Notion Page to Markdown' : 
        'This extension only works on Notion pages'
    });
  }
});

// Handle tab activation (switching between tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    const isNotionSite = tab.url.includes('notion.site');
    
    chrome.action.setIcon({
      tabId: activeInfo.tabId,
      path: isNotionSite ? {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      } : {
        "16": "icons/icon16-disabled.png",
        "48": "icons/icon48-disabled.png",
        "128": "icons/icon128-disabled.png"
      }
    });
  }
}); 