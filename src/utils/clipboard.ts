/**
 * Clipboard Utility
 * 
 * This module provides secure clipboard functionality with fallback support
 * for environments where the Clipboard API is not available.
 */

export interface ClipboardResult {
  success: boolean;
  message: string;
}

/**
 * Copies text to clipboard using the modern Clipboard API
 * Falls back to legacy method if Clipboard API is not available
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  if (!text) {
    return {
      success: false,
      message: 'No text to copy'
    };
  }
  
  // Try modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return {
        success: true,
        message: 'Password copied to clipboard!'
      };
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback method:', error);
    }
  }
  
  // Fallback method for older browsers or non-secure contexts
  try {
    const result = await copyTextFallback(text);
    return result;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to copy to clipboard'
    };
  }
}

/**
 * Fallback clipboard method using temporary textarea element
 */
function copyTextFallback(text: string): Promise<ClipboardResult> {
  return new Promise((resolve) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea invisible
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    textArea.setAttribute('aria-hidden', 'true');
    
    document.body.appendChild(textArea);
    
    try {
      // Select and copy the text
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile devices
      
      const successful = document.execCommand('copy');
      
      if (successful) {
        resolve({
          success: true,
          message: 'Password copied to clipboard!'
        });
      } else {
        resolve({
          success: false,
          message: 'Failed to copy to clipboard'
        });
      }
    } catch (error) {
      resolve({
        success: false,
        message: 'Failed to copy to clipboard'
      });
    } finally {
      document.body.removeChild(textArea);
    }
  });
}

/**
 * Checks if clipboard functionality is available
 */
export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard || document.execCommand);
}