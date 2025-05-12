console.log("script loaded");
console.log("typeof expandShortcuts:", typeof expandShortcuts);
document.addEventListener("keydown", (e) => {
  console.log("hiiiiiiiiii", e.target);
})

function expandShortcuts(event) {
  console.log("expandShortcuts triggered with key:", event.key);
  let target = event.target;

  if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
    if (event.key === " " || event.key === "\n") {
      console.log("Checking for space or enter key...");
      chrome.storage.sync.get("shortcuts", function (data) {
        console.log("Shortcuts loaded from storage:", data);

        let shortcuts = data.shortcuts || {};

        let text = target.value;
        // let shortcuts = {
        //   ":addr": "123 Street, City",
        //   ":email": "user@example.com",
        //   ":ty": "Thank you!",
        // };

        let words = text.split(" ");
        let lastWord = words[words.length - 2];

        if (shortcuts[lastWord]) {
          words[words.length - 2] = shortcuts[lastWord];
          target.value = words.join(" ");
          console.log("Shortcut expanded:", shortcuts[lastWord]);
        }
      });
    }
  }
}

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

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
