console.log("✅ options.js is running!");

let addShortcut = document.getElementById("addShortcut");
let shortcutList = document.getElementById("shortcutList");
let updateShortcut = document.getElementById("updateShortcut")

let shortcuts = {};
let editingKey = null;

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

updateShortcut.addEventListener("click", () => {
    console.log("☄️")
    let key = document.getElementById("shortcutKey").value.trim();
    let value = document.getElementById("expandedKey").value.trim();

    if(key && value && editingKey !== null) {
        if(editingKey !== key) {
            delete shortcuts[key];
        }

        shortcuts[key] = value;
        saveShortcut();
        updateList();

        document.getElementById("shortcutKey").value = "";
        document.getElementById("expandedKey").value = "";
        editingKey = null;

        document.getElementById("addShortcut").style.display = "inline-block";
        document.getElementById("updateShortcut").style.display = "none";
    }
})

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
        });

        let updateBtn = document.createElement("button");
        updateBtn.style.cursor = "pointer";
        updateBtn.style.marginLeft = "10px";
        updateBtn.textContent = "Update";
        updateBtn.addEventListener("click", () => {
            console.log("☑️");
            editingKey = key;

            document.getElementById("shortcutKey").value = key;
            document.getElementById("expandedKey").value = shortcuts[key];

            document.getElementById("addShortcut").style.display = "none";
            document.getElementById("updateShortcut").style.display = "inline-block";
        });
        
        item.appendChild(updateBtn);
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

// Toggle shortcut list visibility
const toggleList = document.getElementById("toggleList");
// const shortcutList = document.getElementById("shortcutList");

toggleList.addEventListener("click", () => {
    const isVisible = shortcutList.classList.toggle("visible");
    toggleList.classList.toggle("collapsed", !isVisible);

    const arrow = toggleList.querySelector(".arrow");
    arrow.textContent = "▶";
});


