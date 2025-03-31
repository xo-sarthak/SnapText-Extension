console.log("✅ options.js is running!");

let addShortcut = document.getElementById("addShortcut");
let shortcutList = document.getElementById("shortcutList");

let shortcuts = {};

chrome.storage.sync.get("shortcuts", (data) => {
    if(data.shortcuts) {
        shortcuts = data.shortcuts;
        updateList();
    }
});

addShortcut.addEventListener("click", (e) => {
    let key = document.getElementById("shortcutKey").value.trim();
    let value = document.getElementById("expandedKey").value.trim();

    if(key && value) {
        shortcuts[key] = value;
        updateList();
        document.getElementById("shortcutKey").value = "";
        document.getElementById("expandedKey").value = "";
    }
})