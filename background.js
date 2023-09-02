async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function getTabUrl() {
    let tab = await getCurrentTab();
    return tab.url;
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    try {
        if (changeInfo.url && changeInfo.url.includes("hdc.smartschool.be")) {
            chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ['agenda.js']
            });
        }
    } catch (error) {
        console.error(error);
    }
});