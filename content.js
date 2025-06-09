class NotionContentExtractor {
  constructor() {
    this.markdown = '';
    this.pageTitle = '';
  }

  extractToMarkdown() {
    console.log('🚀 Starting Notion content extraction...');
    
    this.pageTitle = this.getPageTitle();
    console.log('📝 Page title:', this.pageTitle);
    
    const contentArea = this.findContentArea();
    
    if (!contentArea) {
      throw new Error('Could not find Notion content area');
    }

    console.log('📄 Processing content area:', contentArea);
    this.markdown = this.processElement(contentArea, 0);
    
    console.log('📊 Raw markdown length:', this.markdown.length);
    console.log('📋 Raw markdown preview:', this.markdown.substring(0, 200));
    
    // If we got very little content, try a more aggressive extraction
    if (this.markdown.trim().length < 50) {
      console.log('⚠️ Very little content extracted, trying fallback method...');
      this.markdown = this.fallbackExtraction();
    }
    
    const cleanedMarkdown = this.cleanupMarkdown(this.markdown);
    console.log('✨ Final markdown length:', cleanedMarkdown.length);
    
    return cleanedMarkdown;
  }

  fallbackExtraction() {
    console.log('🔄 Running fallback extraction...');
    
    // Get all text content from the page, filtering out obvious non-content
    const allElements = document.querySelectorAll('*');
    let extractedText = '';
    
    for (const element of allElements) {
      // Skip elements that are clearly not content
      if (this.shouldSkipElement(element)) continue;
      
      // Only process elements with direct text content (not inherited from children)
      const directText = this.getDirectTextContent(element);
      if (directText && directText.length > 10) {
        // Try to determine the appropriate markdown formatting
        const formattedText = this.formatTextByContext(element, directText);
        if (formattedText) {
          extractedText += formattedText + '\n\n';
        }
      }
    }
    
    return extractedText;
  }

  getDirectTextContent(element) {
    let text = '';
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      }
    }
    return text.trim();
  }

  formatTextByContext(element, text) {
    const tagName = element.tagName?.toLowerCase();
    const classList = element.className || '';
    const style = window.getComputedStyle(element);
    
    // Headers
    if (tagName?.match(/^h[1-6]$/) || this.looksLikeHeader(element)) {
      const level = tagName ? parseInt(tagName.charAt(1)) : 2;
      return `${'#'.repeat(level)} ${text}`;
    }
    
    // Code
    if (tagName === 'code' || tagName === 'pre' || classList.includes('code')) {
      return tagName === 'pre' ? `\`\`\`\n${text}\n\`\`\`` : `\`${text}\``;
    }
    
    // Links
    if (tagName === 'a' && element.href) {
      return `[${text}](${element.href})`;
    }
    
    // Strong/Bold
    if (tagName === 'strong' || tagName === 'b' || style.fontWeight === 'bold' || style.fontWeight > 400) {
      return `**${text}**`;
    }
    
    // Emphasis/Italic
    if (tagName === 'em' || tagName === 'i' || style.fontStyle === 'italic') {
      return `*${text}*`;
    }
    
    // Regular text - only return if it's substantial
    return text.length > 15 ? text : null;
  }

  getPageTitle() {
    // Try different selectors for the page title
    const titleSelectors = [
      '[data-block-id] [placeholder="Untitled"]',
      '[data-block-id] h1',
      '.notion-page-block h1',
      '.notion-header-block',
      'h1',
      'title'
    ];

    for (const selector of titleSelectors) {
      const titleEl = document.querySelector(selector);
      if (titleEl && titleEl.textContent.trim()) {
        return this.sanitizeFilename(titleEl.textContent.trim());
      }
    }

    // Fallback to document title or URL
    const docTitle = document.title.replace(' - Notion', '').trim();
    if (docTitle && docTitle !== 'Notion') {
      return this.sanitizeFilename(docTitle);
    }

    return this.sanitizeFilename(window.location.pathname.split('/').pop() || 'notion-export');
  }

  findContentArea() {
    console.log('🔍 Searching for Notion content area...');
    
    // Try to find the main content area using various selectors
    const contentSelectors = [
      '.notion-page-content',
      '.notion-page-block',
      '[data-block-id]',
      'main',
      '.notion-app-inner',
      '.notion-frame',
      '#notion-app',
      '.notion-body',
      '[role="main"]'
    ];

    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`📍 Found ${elements.length} elements for selector: ${selector}`);
      
      if (elements.length > 0) {
        // For data-block-id, find the container that holds multiple blocks
        if (selector === '[data-block-id]') {
          const container = this.findBlockContainer(elements);
          if (container) {
            console.log('✅ Found block container:', container);
            return container;
          }
        } else {
          const element = elements[0];
          console.log('✅ Using content area:', element);
          return element;
        }
      }
    }

    // Enhanced fallback - look for any container with substantial text content
    const allDivs = document.querySelectorAll('div');
    let bestContainer = null;
    let maxTextLength = 0;

    for (const div of allDivs) {
      const textContent = div.textContent?.trim() || '';
      if (textContent.length > maxTextLength && textContent.length > 100) {
        // Make sure it's not a navigation or sidebar element
        if (!this.shouldSkipElement(div)) {
          maxTextLength = textContent.length;
          bestContainer = div;
        }
      }
    }

    if (bestContainer) {
      console.log('✅ Using fallback container with', maxTextLength, 'characters');
      return bestContainer;
    }

    console.log('⚠️ No suitable content area found, using document.body');
    return document.body;
  }

  findBlockContainer(blockElements) {
    // Find the common parent that contains multiple blocks
    if (blockElements.length === 0) return null;
    
    if (blockElements.length === 1) {
      return blockElements[0].parentElement;
    }

    // Find the lowest common ancestor of all blocks
    let container = blockElements[0].parentElement;
    while (container && container !== document.body) {
      const blocksInContainer = container.querySelectorAll('[data-block-id]').length;
      if (blocksInContainer >= Math.min(blockElements.length, 3)) {
        return container;
      }
      container = container.parentElement;
    }

    return blockElements[0].parentElement || document.body;
  }

  processElement(element, depth = 0) {
    if (!element || !this.isVisible(element)) {
      return '';
    }

    // Skip navigation, sidebars, and other non-content elements
    if (this.shouldSkipElement(element)) {
      return '';
    }

    let result = '';
    const tagName = element.tagName?.toLowerCase();
    const textContent = element.textContent?.trim() || '';

    // Handle different Notion block types
    if (element.hasAttribute('data-block-id')) {
      result += this.processNotionBlock(element, depth);
    } else if (tagName) {
      switch (tagName) {
        case 'h1':
          result += `# ${textContent}\n\n`;
          break;
        case 'h2':
          result += `## ${textContent}\n\n`;
          break;
        case 'h3':
          result += `### ${textContent}\n\n`;
          break;
        case 'h4':
          result += `#### ${textContent}\n\n`;
          break;
        case 'h5':
          result += `##### ${textContent}\n\n`;
          break;
        case 'h6':
          result += `###### ${textContent}\n\n`;
          break;
        case 'p':
          if (textContent) {
            result += `${this.processInlineFormatting(element)}\n\n`;
          }
          break;
        case 'blockquote':
          if (textContent) {
            const lines = textContent.split('\n');
            result += lines.map(line => `> ${line}`).join('\n') + '\n\n';
          }
          break;
        case 'code':
          result += `\`${textContent}\``;
          break;
        case 'pre':
          result += `\`\`\`\n${textContent}\n\`\`\`\n\n`;
          break;
        case 'ul':
        case 'ol':
          result += this.processList(element, depth, tagName === 'ol');
          break;
        case 'li':
          // Handled by processList
          break;
        case 'a':
          const href = element.getAttribute('href');
          if (href && textContent) {
            result += `[${textContent}](${href})`;
          } else {
            result += textContent;
          }
          break;
        case 'strong':
        case 'b':
          result += `**${textContent}**`;
          break;
        case 'em':
        case 'i':
          result += `*${textContent}*`;
          break;
        case 'del':
        case 's':
          result += `~~${textContent}~~`;
          break;
        default:
          // For other elements, process children
          for (const child of element.children) {
            result += this.processElement(child, depth);
          }
          // If no children but has text content, add it
          if (element.children.length === 0 && textContent) {
            result += textContent + ' ';
          }
      }
    } else {
      // Text node
      if (textContent && element.nodeType === Node.TEXT_NODE) {
        result += textContent + ' ';
      }
    }

    return result;
  }

  processNotionBlock(element, depth) {
    const textContent = element.textContent?.trim() || '';
    let result = '';

    // Identify block type by class names or structure
    const classList = element.className || '';
    
    console.log(`🔧 Processing block: ${classList}, text: "${textContent.substring(0, 50)}..."`);
    
    // Header blocks - be more flexible with detection
    if (classList.includes('header') || classList.includes('heading') ||
        element.querySelector('h1, h2, h3, h4, h5, h6') ||
        (textContent && this.looksLikeHeader(element))) {
      const level = this.getHeaderLevel(element);
      result += `${'#'.repeat(level)} ${textContent}\n\n`;
    }
    // Text blocks - broader detection
    else if (classList.includes('text') || classList.includes('paragraph') ||
             element.querySelector('[data-content-editable-leaf="true"]') ||
             element.querySelector('[contenteditable]')) {
      if (textContent) {
        result += `${this.processInlineFormatting(element)}\n\n`;
      }
    }
    // Quote blocks
    else if (classList.includes('quote') || classList.includes('callout')) {
      if (textContent) {
        const lines = textContent.split('\n');
        result += lines.map(line => `> ${line}`).join('\n') + '\n\n';
      }
    }
    // Code blocks
    else if (classList.includes('code') || element.querySelector('code, pre')) {
      const codeElement = element.querySelector('code, pre') || element;
      const code = codeElement.textContent || '';
      result += `\`\`\`\n${code}\n\`\`\`\n\n`;
    }
    // List blocks - more flexible detection
    else if (classList.includes('list') || classList.includes('bullet') || classList.includes('numbered')) {
      const marker = classList.includes('numbered') ? '1.' : '-';
      const indent = ' '.repeat(depth * 2);
      result += `${indent}${marker} ${this.processInlineFormatting(element)}\n`;
    }
    // Toggle blocks
    else if (classList.includes('toggle')) {
      result += `<details>\n<summary>${textContent}</summary>\n\n`;
      // Process children
      for (const child of element.children) {
        result += this.processElement(child, depth + 1);
      }
      result += `</details>\n\n`;
    }
    // Column blocks (handle multi-column layouts)
    else if (classList.includes('column')) {
      // Process all nested blocks
      const nestedBlocks = element.querySelectorAll('[data-block-id]');
      for (const block of nestedBlocks) {
        if (block !== element) { // Avoid infinite recursion
          result += this.processElement(block, depth);
        }
      }
      // If no nested blocks, process children normally
      if (nestedBlocks.length === 0) {
        for (const child of element.children) {
          result += this.processElement(child, depth);
        }
      }
    }
    // Generic blocks with text content
    else if (textContent) {
      // Try to process children first to see if we get better results
      let childrenResult = '';
      for (const child of element.children) {
        childrenResult += this.processElement(child, depth);
      }
      
      if (childrenResult.trim()) {
        result += childrenResult;
      } else {
        result += `${this.processInlineFormatting(element)}\n\n`;
      }
    }

    return result;
  }

  looksLikeHeader(element) {
    const text = element.textContent?.trim() || '';
    if (!text) return false;
    
    // Check for header-like characteristics
    const style = window.getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = style.fontWeight;
    
    // Look for larger fonts or bold text that's relatively short
    return (fontSize > 16 || fontWeight === 'bold' || fontWeight > 400) && 
           text.length < 100 && 
           !text.includes('\n');
  }

  getHeaderLevel(element) {
    // Try to determine header level from classes or structure
    const classList = element.className || '';
    if (classList.includes('notion-header-block')) {
      if (classList.includes('notion-h1-block')) return 1;
      if (classList.includes('notion-h2-block')) return 2;
      if (classList.includes('notion-h3-block')) return 3;
    }
    
    // Check for semantic header tags
    const headerTag = element.querySelector('h1, h2, h3, h4, h5, h6');
    if (headerTag) {
      return parseInt(headerTag.tagName.charAt(1));
    }

    // Default to h2 for unknown header blocks
    return 2;
  }

  processInlineFormatting(element) {
    let text = '';
    
    // Check for formatting spans within the element
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        let nodeText = node.textContent;
        let parent = node.parentElement;
        
        // Skip if this text node is inside a UI element we should ignore
        let shouldSkipText = false;
        let currentParent = parent;
        while (currentParent && currentParent !== element) {
          if (this.shouldSkipElement(currentParent)) {
            shouldSkipText = true;
            break;
          }
          currentParent = currentParent.parentElement;
        }
        
        if (shouldSkipText) {
          continue;
        }
        
        // Apply formatting based on parent elements
        while (parent && parent !== element) {
          const tag = parent.tagName?.toLowerCase();
          const style = parent.getAttribute('style') || '';
          
          if (tag === 'strong' || tag === 'b' || style.includes('font-weight: bold')) {
            nodeText = `**${nodeText}**`;
          } else if (tag === 'em' || tag === 'i' || style.includes('font-style: italic')) {
            nodeText = `*${nodeText}*`;
          } else if (tag === 'code' || parent.classList.contains('notion-inline-code')) {
            nodeText = `\`${nodeText}\``;
          } else if (tag === 'del' || tag === 's' || style.includes('text-decoration: line-through')) {
            nodeText = `~~${nodeText}~~`;
          } else if (tag === 'a') {
            const href = parent.getAttribute('href');
            if (href) {
              nodeText = `[${nodeText}](${href})`;
            }
          }
          
          parent = parent.parentElement;
        }
        
        text += nodeText;
      }
    }

    // Clean up the text to remove UI artifacts
    text = this.cleanUIArtifacts(text);
    return text || element.textContent?.trim() || '';
  }

  cleanUIArtifacts(text) {
    // Remove common UI text that might slip through
    const uiPatterns = [
      /\bPlain Text\b/gi,
      /\bCopy\b(?!\s+[a-z])/gi,  // "Copy" but not "Copy this text"
      /\bCopied\b/gi,
      /\bEdit\b(?!\s+[a-z])/gi,  // "Edit" but not "Edit this document"
      /\bDelete\b(?!\s+[a-z])/gi,
      /\bDuplicate\b(?!\s+[a-z])/gi,
      /\bMove\b(?!\s+[a-z])/gi,
      /\bShare\b(?!\s+[a-z])/gi,
      /•{3}/g,  // Three dots
      /⋮/g,     // Vertical ellipsis
      /⋯/g      // Horizontal ellipsis
    ];
    
    let cleanedText = text;
    uiPatterns.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });
    
    // Clean up extra whitespace
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
    
    return cleanedText;
  }

  processList(listElement, depth, isOrdered = false) {
    let result = '';
    const items = listElement.querySelectorAll(':scope > li');
    
    items.forEach((item, index) => {
      const indent = ' '.repeat(depth * 2);
      const marker = isOrdered ? `${index + 1}.` : '-';
      const content = this.processInlineFormatting(item);
      
      result += `${indent}${marker} ${content}\n`;
      
      // Process nested lists
      const nestedLists = item.querySelectorAll(':scope > ul, :scope > ol');
      nestedLists.forEach(nestedList => {
        result += this.processList(nestedList, depth + 1, nestedList.tagName.toLowerCase() === 'ol');
      });
    });
    
    return result + '\n';
  }

  shouldSkipElement(element) {
    if (!element || !element.tagName) return true;
    
    const tagName = element.tagName.toLowerCase();
    const classList = element.className || '';
    const id = element.id || '';
    const textContent = element.textContent?.trim() || '';
    
    // Skip obvious non-content elements
    if (['script', 'style', 'meta', 'link', 'noscript'].includes(tagName)) {
      return true;
    }
    
    // Skip specific UI text that appears in Notion interface
    const uiTextPatterns = [
      /^plain text$/i,
      /^copy$/i,
      /^copied$/i,
      /^edit$/i,
      /^delete$/i,
      /^duplicate$/i,
      /^move$/i,
      /^share$/i,
      /^comment$/i,
      /^•{3}$/,  // Three dots menu
      /^⋮$/,     // Vertical ellipsis
      /^⋯$/      // Horizontal ellipsis
    ];
    
    // Skip if text content matches UI patterns
    if (uiTextPatterns.some(pattern => pattern.test(textContent))) {
      return true;
    }
    
    // Skip elements that are likely navigation or UI
    const skipPatterns = [
      'topbar', 'sidebar', 'navbar', 'menu', 'navigation',
      'overlay', 'modal', 'popup', 'tooltip', 'cursor',
      'scroller', 'peek', 'button', 'icon', 'logo',
      'share', 'comment', 'reaction', 'like', 'follow',
      'copy', 'edit', 'delete', 'duplicate', 'move'
    ];

    const elementText = (classList + ' ' + id).toLowerCase();
    
    // Be more selective - only skip if it clearly matches UI patterns
    const shouldSkip = skipPatterns.some(pattern => 
      elementText.includes(pattern) && 
      // But don't skip if it seems to contain substantial content
      textContent.length < 100
    );
    
    // Also skip hidden elements
    if (shouldSkip || !this.isVisible(element)) {
      return true;
    }
    
    // Skip elements that are primarily buttons or inputs
    if (['button', 'input', 'select', 'textarea'].includes(tagName)) {
      return true;
    }
    
    // Skip elements with role="button" or other interactive roles
    const role = element.getAttribute('role');
    if (['button', 'menuitem', 'tab', 'option'].includes(role)) {
      return true;
    }
    
    // Skip elements that look like UI controls based on their position and size
    if (this.looksLikeUIControl(element)) {
      return true;
    }
    
    return false;
  }

  looksLikeUIControl(element) {
    const textContent = element.textContent?.trim() || '';
    const style = window.getComputedStyle(element);
    
    // Skip very short text that's likely UI labels
    if (textContent.length <= 15 && textContent.length > 0) {
      // Check if it's positioned like a button or control
      const position = style.position;
      const cursor = style.cursor;
      
      // Elements with pointer cursor and short text are likely clickable UI
      if (cursor === 'pointer' && textContent.length < 10) {
        return true;
      }
      
      // Absolutely positioned short text is often UI
      if (position === 'absolute' && textContent.length < 8) {
        return true;
      }
    }
    
    return false;
  }

  isVisible(element) {
    if (!element) return false;
    
    // Check if element is hidden
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }

  cleanupMarkdown(markdown) {
    return markdown
      // Remove excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Remove trailing spaces
      .replace(/ +$/gm, '')
      // Clean up list formatting
      .replace(/^(\s*[-\*\+])\s*$/gm, '')
      // Remove empty headers
      .replace(/^#+\s*$/gm, '')
      .trim();
  }
} 