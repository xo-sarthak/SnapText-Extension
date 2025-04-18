document.addEventListener("keydown", function (event) {
  let target = event.target;

  if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
    if (event.key === " " || event.key === "\n") {
      chrome.storage.sync.get("shortcuts", function(data) {
        let shortcuts = data.shortcuts || {};
      });
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
      }
    }
  }
});
