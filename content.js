console.log("script loaded");

let shortcuts = {};
// console.log("typeof expandShortcuts:", typeof expandShortcuts);

// Load shortcuts once at startup
function loadShortcuts() {
  chrome.storage.sync.get("shortcuts", function (data) {
    console.log("shortcurtsloaded from storage", data);
    shortcuts = data.shortcuts || {};
  });
}

loadShortcuts();

// Attaching expand listener to already existing elements
document
  .querySelectorAll("input, textarea, [contenteditable='true']")
  .forEach((el) => {
    el.addEventListener("keydown", expandShortcuts);
  });
document.addEventListener("keydown", (e) => {
  console.log("Keydown detected on: ", e.target.tagName, e.target);
});

// Main expansion logic
function expandShortcuts(event) {
  if (event.key === " " || event.key === "Tab") {
    console.log("Shortcut Trigger Key:", event.key);

    if (event.key === "Tab") {
      event.preventDefault();
    }

    let target = event.target;

    if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
      processInputOrTextArea(target);
    } else if (target.isContentEditable) {
      processContentEditable(target);
    }
  }
}

// Process <input> and <textarea>
function processInputOrTextArea(element) {
  let text = element.value;
  let cursorPosition = element.selectionStart;
  let textBeforeCursor = text.substring(0, cursorPosition);
  let words = text.split(" ");
  let lastWord = words[words.length - 1];

  console.log("Last word detected:", lastWord);

  if (shortcuts[lastWord]) {
    const lastWordStart = textBeforeCursor.length - lastWord.length;
    const newText =
      text.substring(0, lastWordStart) +
      shortcuts[lastWord] +
      text.substring(cursorPosition);
    element.value = newText;

    const newPosition = lastWordStart + shortcuts[lastWord].length;

    // the line below dosent return anything so no need to assign it to anything
    element.setSelectionRange(newPosition, newPosition);
  }

  console.log("lastWord", lastWord);
}

// Process [contenteditable]
function processContentEditable(element) {
  const selection = window.getSelection();
  if(!selection.rangeCount) return;

  const range = selection.getRangeAt(0); // the comment below contains everthing this line will give us that will be used further in code by doing "range.xyz", like done below for node and offset.
//   Range {
//   startContainer: #text "Hello, this is a test.",
//   startOffset: 11,
//   endContainer: #text "Hello, this is a test.",
//   endOffset: 11,
//   collapsed: true
// }
  const node = range.startContainer; // For example, in <div contenteditable>hi|</div>, this would be the text node containing "hi".
  const offset = range.startOffset; // in short gives the index of caret

  // trying to stay in text node
  if(node.nodeType !== Node.TEXT_NODE) return; // a check to verify the node being a text node, if not a text node, function stops.

  const text = node.textContent;
  const textBeforeCursor = text.substring(0, offset); // selects all the text before the caret position that is the offset.
  const words = textBeforeCursor.split(" "); // splits the text before the caret into words based on spaces
  const lastWord = words[words.length - 1];

  if(shortcuts[lastWord]) {
    const lastWordStart = textBeforeCursor.length - lastWord.length;
    const expandedText = shortcuts[lastWord];
    const newText = text.substring(0, lastWordStart) + expandedText + text.substring(offset); // here we basically create the new word, with only one value present in substring method, what it does is that starts from there and goes till end of the text node, good way no not alter with whats after the caret position.
    // below is the example of whats happening
    // text = "see you brb"
    // offset = 10

    // text.substring(0, 7) = "see you "
    // expandedText = "be right back"
    // text.substring(10) = "" (caret was at the end)

    // newText = "see you be right back"
    node.textContent = newText; // updating the node text with new one.
    const newOffset = lastWordStart + expandedText.length; // new caret position: right after the expanded word, even if there's more text after it.
    const newRange = document.createRange(); // range means something that tells where the caret should be like between what and in which node just like we saw above, it has things like this in it.
    newRange.setStart(node, newOffset); // tells where the caret should be placed after replacement, like in "node" at offset i.e. the index where it ends.
    newRange.collapse(true); // turns the range into a collapsed range meaning now we dont have a selection of text, just a caret i.e. start === end just like a caret that starts and ends at the same position.

    selection.removeAllRanges(); // removes the existing range i.e the previous one.
    selection.addRange(newRange); // adds this new range.
  }
}
