document.addEventListener("input", function(event) {
    let target = event.target;

    if(target == TEXTAREA || target == INPUT) {
        let text = target.value;
    }

    let shortcuts = {
        ":addr": "123 Street, City",
        ":email": "user@example.com",
        ":ty": "Thank you!",
    };

    for(let key in shortcuts) {
        text = text.replaceAll(key, shortcuts[key]);
    }
    target.value = text;
})