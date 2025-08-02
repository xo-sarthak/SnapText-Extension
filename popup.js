document.addEventListener("DOMContentLoaded", () => {
  // this waits for the dom to be loaded completely tht is popup html file as my script tag is in the head of html, so i would not want it to run before anything else is loaded.
  const toggle = document.getElementById("toggle-extension");
  const manageBtn = document.getElementById("manageShortcutsBtn");

  console.log("ssup");
  console.log("toggle", toggle);

  // Load toggle state
  chrome.storage.sync.get("snapTextEnabled", (data) => {
    toggle.checked = data.snapTextEnabled !== false; // .checked only exists for checkboxes and give booleans, true/false. // this line is comparing true and false, read carefully and then passing tht true and false fromt the comparision to toggle.checked.
  });

  // So I don’t set enabled at first, which makes undefined !== false → true, and sets toggle to checked.
  // Then I save the toggle state on change, which stores real true/false in Chrome.
  // And after that, the next time I get it(on page load), it's an actual value from Chrome.

  // Save toggle state
  toggle.addEventListener("change", () => {
    // event listener "change" looks for a change and then sets enabled as the way
    chrome.storage.sync.set({ snapTextEnabled: toggle.checked }); // this sets enabled as true or false then the above get function can easily access whats in enabled.
  });

  // Open options page
  manageBtn.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  });
  // For opening the options page we are having two approaches "if" approach is the one that uses the latest approach to open the page but some browsers may not accept it or support it so we have the "else" approach that focuses on manually opening the options page.
});
