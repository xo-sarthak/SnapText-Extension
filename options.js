console.log("✅ options.js is running!");

let addShortcut = document.getElementById("addShortcut");
let saveShortcut = document.getElementById("saveShortcut");
let shortcutList = document.getElementById("shortcutList");

let shortcuts = {};

chrome.storage.sync.get("shortcuts", (data) => {
    if(chrome.runtime.lastError) {
        console.error("❌", chrome.runtime.lastError);
        return;
    }
    console.log("hello");
    console.log("x", data);
    if(data.shortcuts) {
        shortcuts = data.shortcuts;
        console.log("y", shortcuts);
        updateList();
    } else {
        console.log("blahh")
    }
})