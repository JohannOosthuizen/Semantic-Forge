// This script runs in the context of the web page.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Note: It's crucial to return true from the listener to indicate
    // that you will be calling sendResponse asynchronously.
    let willRespondAsync = false;

    if (request.action === "getTextContent") {
        willRespondAsync = true;
        const textContent = document.body.innerText;
        sendResponse({ textContent: textContent });
    }
    
    if (request.action === "replaceContent") {
        willRespondAsync = true;
        if (request.html) {
            document.documentElement.innerHTML = request.html;
            sendResponse({ status: "success" });
        } else {
            sendResponse({ status: "error", message: "No HTML provided." });
        }
    }

    return willRespondAsync;
});
