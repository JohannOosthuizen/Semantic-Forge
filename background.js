// background.js

// Listener for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the message is to get the API key
  if (request.action === 'getApiKey') {
    // Retrieve the key from storage
    chrome.storage.sync.get('geminiApiKey', (data) => {
      if (chrome.runtime.lastError) {
        // Handle potential errors
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ apiKey: data.geminiApiKey });
      }
    });
    // Return true to indicate you will send a response asynchronously
    return true;
  }
});
