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
        saveShortcut();
        document.getElementById("shortcutKey").value = "";
        document.getElementById("expandedKey").value = "";
    }
});

function saveShortcut() {
    chrome.storage.sync.set({ shortcuts }, () => {
        showSaveStatus();
    })
}

function deleteShortcut() {
    chrome.storage.sync.set({ shortcuts }, () => {
        showDeleteStatus();
    })
}

function updateList() {
    shortcutList.innerHTML = "";
    for(let key in shortcuts) {
        let item = document.createElement("li");
        item.textContent = `${key} -> ${shortcuts[key]}`;

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.style.cursor = "pointer"
        deleteBtn.addEventListener("click", () => {
            console.log("❌");
            delete shortcuts[key];
            deleteShortcut();
            updateList();
        })

        item.appendChild(deleteBtn);
        shortcutList.appendChild(item);
    }
}

function showSaveStatus() {
    let saveStatus = document.getElementById("saveStatus");
    if(!saveStatus) return;

    saveStatus.textContent = "✅ Shortcut Saved";
    saveStatus.style.opacity = "1";

    setTimeout(() => {
        saveStatus.style.opacity = "0";
    }, 1500);
}

function showDeleteStatus() {
    let deleteStatus = document.getElementById("deleteStatus");
    if(!deleteStatus) return;
    
    deleteStatus.textContent = "Shortcut Deleted ❌";
    deleteStatus.style.opacity = "1";

    setTimeout(() => {
        deleteStatus.style.opacity = "0"
    }, 1500);
}

