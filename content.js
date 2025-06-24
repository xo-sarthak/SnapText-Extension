const { computeHeadingLevel } = require("@testing-library/react");

console.log("script loaded");
console.log("typeof expandShortcuts:", typeof expandShortcuts);
document
  .querySelectorAll("input, textarea, [contenteditable='true']")
  .forEach((el) => {
    el.addEventListener("keydown", expandShortcuts);
  });
document.addEventListener("keydown", (e) => {
  console.log("hiiiiiiiiii", e.target.tagName, e.target);
});

function loadShortcuts() {
  chrome.storage.sync.get("shortcuts", function(data) {
    console.log("shortcurtsloaded from storage", data);
    shortcuts = data.shortcuts || {};
  })
}

loadShortcuts();

function expandShortcuts(event) {
  console.log("expandShortcuts triggered with key:", event.key);
  let target = event.target;

  if (
    target.tagName === "TEXTAREA" ||
    target.tagName === "INPUT" ||
    target.isContentEditable
  ) {
    console.log("Keydown on:", target.tagName, target);

    if (event.key === " " || event.key === "Enter") {
      console.log("Checking for space or enter key...", event.key);

      if(target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        processInputOrTextArea(target);
      } else if(target.isContentEditable) {
        processContentEditable(target);
      }
      // chrome.storage.sync.get("shortcuts", function (data) {
      //   console.log("Shortcuts loaded from storage:", data);

      //   let shortcuts = data.shortcuts || {};

      //   let text = target.value;
      //   // let shortcuts = {
      //   //   ":addr": "123 Street, City",
      //   //   ":email": "user@example.com",
      //   //   ":ty": "Thank you!",
      //   // };

      //   let words = text.split(" ");
      //   let lastWord = words[words.length - 2];

      //   if (shortcuts[lastWord]) {
      //     words[words.length - 2] = shortcuts[lastWord];
      //     target.value = words.join(" ");
      //     console.log("Shortcut expanded:", shortcuts[lastWord]);
      //   }
      // });
    }
  }
}

function processInputOrTextArea(element, key) {
  let text = element.value;
  let cursorPosition = element.selectionStart;
  let textBeforeCursor = text.substring(0, cursorPosition);
  let words = text.split(" ");
  let lastWord = words[words.length - 1];

  if(shortcuts[lastWord]) {
    const lastWordStart = textBeforeCursor.length - lastWord.length;
    const newText = text.substring(0, lastWordStart) + shortcuts[lastWord] + text.substring(cursorPosition);
    element.value = newText;

    const newPosition = lastWordStart + shortcuts[lastWord].length;
    
  }

  console.log("lastWord", lastWord);

  if(shortcuts[lastWord]) {
    words[words.length - 2] = shortcuts[lastWord];
    element.value = words.join(" ");
    console.log("shortcut expanded", shortcuts[lastWord])
  }
}

function processContentEditable(element) {
  let selection = window.getSelection();
  if(selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const textBeforeCursor = range.startContainer.textContent;
    const words = textBeforeCursor.split(" ");
    const lastWord = words[words.length - 2];

  }
}

document.addEventListener("DOMContentLoaded",  () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        Array.from(mutation.addedNodes).forEach((node) => {
          if (
            node.nodeType === 1 &&
            (node.tagName === "TEXTAREA" ||
              node.tagName === "INPUT" ||
              node.isContentEditable)
          ) {
            node.addEventListener("keydown", expandShortcuts);
          }
        });
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
