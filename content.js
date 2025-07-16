// if(!snapTextEnabled) return; // commented out as it can be undefined and null and give false due to them being falsy or not true exactly which will stop the execution of the code due to return, so we by default set it to true;
// the logic where i check if the extension is enabled or disabled by the user.
let snapTextEnabled = true;

chrome.storage.sync.get("snapTextEnabled", (data) => {
  snapTextEnabled = data.snapTextEnabled ?? true; // if data.snapTextEnabled is having a value then take it, else return true;
});
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
  // let words = text.split(" ");
  // let lastWord = words[words.length - 1]; the reason these two lines have been commented out is because we have created a helper function that will do work of these lines.
  // let lastWord = getLastWord(textBeforeCursor); // changing this to line below, sanitize fix!!!
  const {  original, sanitized } = getLastWord(textBeforeCursor);

  console.log("Last word detected:", lastWord);

  if (shortcuts[sanitized]) { // changes were made lastWord -> sanitized.
    // const lastWordStart = textBeforeCursor.length - lastWord.length;
    // const newText =
    //   text.substring(0, lastWordStart) +
    //   shortcuts[lastWord] +
    //   text.substring(cursorPosition);
    // element.value = newText;

    // const newPosition = lastWordStart + shortcuts[lastWord].length;

    // // the line below dosent return anything so no need to assign it to anything
    // element.setSelectionRange(newPosition, newPosition); 
    // THIS WHOLE CODE BLOCK ABOVE IS REPLACED BY THE FUNCTION CALL BELOW.
    const { newText, newCursorPosition } = replaceLastWordInText(text, cursorPosition, original, shortcuts[sanitized]);
    element.value = newText;
    element.setSelectionRange(newCursorPosition, newCursorPosition);
  }

  console.log("original", original);
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
  // const words = textBeforeCursor.split(" "); // splits the text before the caret into words based on spaces
  // const lastWord = words[words.length - 1]; // the reason these two lines have been commented out is because we have created a helper function that will do work of these lines.
  const { original, sanitized } = getLastWord(textBeforeCursor);

  // if(shortcuts[lastWord]) {
  //   const lastWordStart = textBeforeCursor.length - lastWord.length;
  //   const expandedText = shortcuts[lastWord];
  //   const newText = text.substring(0, lastWordStart) + expandedText + text.substring(offset); // here we basically create the new word, with only one value present in substring method, what it does is that starts from there and goes till end of the text node, good way no not alter with whats after the caret position.
  //   // below is the example of whats happening
  //   // text = "see you brb"
  //   // offset = 10

  //   // text.substring(0, 7) = "see you "
  //   // expandedText = "be right back"
  //   // text.substring(10) = "" (caret was at the end)

  //   // newText = "see you be right back"
  //   node.textContent = newText; // updating the node text with new one.
  //   const newOffset = lastWordStart + expandedText.length; // new caret position: right after the expanded word, even if there's more text after it.
  //   const newRange = document.createRange(); // range means something that tells where the caret should be like between what and in which node just like we saw above, it has things like this in it.
  //   newRange.setStart(node, newOffset); // tells where the caret should be placed after replacement, like in "node" at offset i.e. the index where it ends.
  //   newRange.collapse(true); // turns the range into a collapsed range meaning now we dont have a selection of text, just a caret i.e. start === end just like a caret that starts and ends at the same position.

  //   selection.removeAllRanges(); // removes the existing range i.e the previous one.
  //   selection.addRange(newRange); // adds this new range.
  // }
  // THE CODE/FUNCTION BELOW HAS REPLACED WHAT HAS BEEN COMMENTED OUT ON TOP. 
  if(shortcuts[sanitized]) { // changes were made lastWord -> sanitized
    replaceLastWordInContentEditable(node, offset, original, shortcuts[sanitized]);
  }
}

// alright now to add better functionality to the extension.
// implementing MutationObserver.
// we need this to make our extension compatible with SPAs(Single Page Applications).
// currently we can handle elements that were loaded on the page with the initial load, but we cant handle inputs and editors added dynamically after the page load, in order to detect them we would require this.
// example of SPAs - Notion, Gmail.

function isTargetElement(el) {    // the basic use case of this function is that we will call this fucntion whenever we need to check if the node/element is textarea, input or contenteditable, and it will be returning true or false.
  return (                        // this dosent work on its own, we use it just to check so we call it when we need and it answers accordingly.
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable
  ); // basically to detect input, textarea and contenteditable like we did above
} // this return is a boolean type, wil return true or false

const observer = new MutationObserver((mutationsList) => { // so here this MutationObserver is an object that watches the DOM, and whenever the change is detected like an element is added, it triggers the callback function present inside mutationsList i.e. for list of changes that took place.
  for(const mutation of mutationsList) {      // this means out of the list provided to it of the changes that is mutations here, take a single mutation, its written here like a enhanced for loop in java.
    if(mutation.type === "childList") {      // we only want to cater the new elements added so we onky focus on the type "childList".
      mutation.addedNodes.forEach((node) => {  // for every change/mutation taking place, there can be multiple elements/nodes added for each mutation so we need to sort out the ones we need.
        if(!(node instanceof HTMLElement)) return;   // If the node is not an HTMLElement, we skip it (like text comments, etc.).
        
        if(isTargetElement(node)) {     // we call the function from top that we created to check. this if condition is checking the "parent node".
          node.addEventListener("keydown", expandShortcuts);   // if it says true that means we found the element/node that concerns us, meaning we will cater it.
        }

        if(node.nodeType === Node.ELEMENT_NODE && node.querySelectorAll) {    // this if condition is for the children elements under the parent, for cases like if parent isnt a input, textarea or contenteditable but the children are.
          const fields = node.querySelectorAll("input, textarea, [contenteditable='true']");    // querySelector is required in order to select those 3 things out of the element
          fields.forEach((el) => {
            el.addEventListener("keydown", expandShortcuts);
          });
        }
      });
    }
  }
});

observer.observe(document.body, {   // here we are telling observer to keep watching the complete body of the document for changes.
  childList: true,    // this tells the observer to watch for the nodes that are being added and removed in the given section, in this case the whole body.
  subtree: true,      // this tells the observer to dive deeper meaning dont just watch document.body but also recursively go deep inside the nested child of the body.
});
// We’re telling the observer:
// “Start watching the entire page for any new elements added anywhere inside it — not just on top-level body but deep down too.”

chrome.storage.onChanged.addListener((changes, namespace) => {
  // Listen for changes in Chrome storage
  if (namespace === "sync" && changes.shortcuts) {
    // If 'shortcuts' changed in the 'sync' storage area
    shortcuts = changes.shortcuts.newValue || {};  // Update local shortcuts object
    console.log("Shortcuts updated from storage:", shortcuts);
  }
});

// the part below will be used to modularize the shortcut logic.
// why is it needed, because both processInputOrTextArea() and processContentEditable() are doing all the work of detecting, caret positioning and replacing the word, in order to take load off of them we will modularize the logic with 3 helper functions

function getLastWord(textBeforeCursor) {
  const words = textBeforeCursor.trim().split(/\s+/); // this is just a fucntion that is splitting and adding words to an array.
  // return words[words.length - 1] || "";  // commented this out after creating sanitized function. lines below this comment are also added after creation of sanitize.
  // const lastWord = words[words.length - 1] || ""; // commented out to fix sanitize error, line is below is what replaces it. // replacing lastWord with originial, to keep check of "yes," and "yes".
  const original = words[words.length - 1] || "";
  const sanitized = sanitize(original);
  return { original, sanitized };
  // Now getLastWord() gives you both:
  // original → e.g., "yes,"
  // sanitized → e.g., "yes"
} 

function replaceLastWordInText(text, cursorPosition, lastWord, expansion) {
  const textBeforeCursor = text.substring(0, cursorPosition);
  const lastWordStart = textBeforeCursor.length - lastWord.length;

  const newText = text.substring(0, lastWordStart) + expansion + text.substring(cursorPosition);

  const newCursorPosition = lastWordStart + expansion.length;

  return {newText, newCursorPosition}; // here we are returning an object, basically we can return once only, so we return the object contaiing multiple values that helps us to get more out of the function.
}

function replaceLastWordInContentEditable(node, offset, lastWord, expansion) {
  const selection = window.getSelection();
  if(!selection) return;

  const text = node.textContent;
  const textBeforeCursor = text.substring(0, offset);
  const lastWordStart = textBeforeCursor.length - lastWord.length; // tip for last word start - always take it according to textbeforecursor, meaning in accordance to the cursor.
  

  const newText = text.substring(0, lastWordStart) + expansion + text.substring(offset);

  node.textContent = newText;

  const newOffset = lastWordStart + expansion.length;
  const newRange = document.createRange();
  newRange.setStart(node, newOffset); // tells from where to start in what, means in the node start at newOffSet.
  // If node.textContent = "hello world" and newOffset = 5, then the caret will be placed between "hello" and " world"
  newRange.collapse(true); // collapsing means not selecting or highlighting anything means just the caret position.
  // Together, these two lines say: "Put the caret at index newOffset inside this text node — and don’t select anything."

  selection.removeAllRanges();
  selection.addRange(newRange);
}

// my approach will be to have a recursive call cause we dont know how many puntuations a user would have.
// function sanitize(textBeforeCursor) {
//   if(words[words.length - 1] !== "." || "," || "!" || "?" || ";" || ":") {
//     lastWord = words[words.length - 1];
//     return lastWord;
//   }
//   const words = textBeforeCursor.trim().split(/\s+/);
//   if(words[words.length - 1] === "." || "," || "!" || "?" || ";" || ":") {
//     words.splice(words.length - 1, 1);
//     sanitize(textBeforeCursor);
//   }
// }

//COMMENTED OUT MY RECURSIVE APPROACH ABOVE AS IT HAD SOME ERRORS, FIXED VERSION IS BELOW
function sanitize(textBeforeCursor) {
  const words = textBeforeCursor.trim().split(/\s+/);
  let lastWord = words[words.length - 1];

  // Base Case.
  if(!/[.,!?;:]$/.test(lastWord)) {
    return lastWord;
  }
  
  // removing trailing punctuation.
  lastWord = lastWord.slice(0, -1); // here we have updated last word by removing punctuation from the last.  // In JavaScript, when you use .slice(0, -1) on a string, it means: 0 is the starting index (the very beginning of the string). -1 is a special value: it means "up to, but not including, the last character."
  words[words.length - 1] = lastWord;

  // recursive call.
  return sanitize(words.join(" ")); // It takes the array of words and joins them back into a single string, inserting a space (" ") between each word.
}

chrome.storage.onChanged.addListener((change, namespace) => { // to see if user enables/disables extension while being on the page itself.
  if(namespace === "sync" && change.snapTextEnabled) {
    snapTextEnabled = change.snapTextEnabled.newValue;
    console.log("Toggle updated:", snapTextEnabled);
  }
});