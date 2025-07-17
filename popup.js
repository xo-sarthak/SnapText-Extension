document.addEventListener('DOMContentLoaded', () => {
    const toggleCheckBox = document.getElementById("toggle-extemntion");
    const manageShortcutsBtn = document.getElementById('manageShortcutsBtn');

    chrome.storage.sync.get('[snapTextEnabled]', (data) => {
        toggleCheckBox.checked = data.snapTextEnabled ?? true;
    });
    
    toggleCheckBox.addEventListener('change', () => {
        const isEnabled = toggleCheckBox.checked;
        chrome.storage.sync.set({snapTextEnabled : isEnabled});
    });

    manageShortcutsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
})