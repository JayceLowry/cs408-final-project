window.onload = loaded;

/**
 * Simple Function that will be run when the browser is finished loading.
 */
function loaded() {
    // Assign to a variable so we can set a breakpoint in the debugger!
    const hello = sayHello();
    console.log(hello);

    loadNotes();
}

/**
 * This function returns the string 'hello'
 * @return {string} the string hello
 */
export function sayHello() {
    return 'hello';
}

const showFormButton = document.getElementById("showform");
const hideFormButton = document.getElementById("hideform");
const addNotePopup = document.getElementById("popup");

/* Show the add note popup */
showFormButton.addEventListener("click", function() {
    addNotePopup.style.display = "block";
});

/* Hide the add note popup */
hideFormButton.addEventListener("click", function() {
    addNotePopup.style.display = "none";
});

/* Handles adding a new note */
document.getElementById("add-note").addEventListener("submit", function(event){
    event.preventDefault();

    const noteTitle = document.getElementById("title").value;
    const timeStamp = Date.now();
    const noteId = `note-${timeStamp}-${Math.floor(Math.random() * 1000)}`;
    const contentTag = ""; // TODO get user-specified tag

    const dataOut = {
        "id": `${noteId}`,
        "title": `${noteTitle}`,
        "content": "...",
        "tag": `${contentTag}`,
        "timestamp": `${timeStamp}`
    }

    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(dataOut));

    addNotePopup.style.display = "none";
    document.getElementById("notes").appendChild(createEntry(dataOut));
});

/* Handler for retrieving data from the server */
document.getElementById("load-items").addEventListener("submit", function(event) {
    event.preventDefault();

    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        loadNotes(JSON.parse(xhr.response));
    });
    xhr.open("GET", "https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items");
    xhr.send();
});

/**
 * Retrieves notes from the server and updates the DOM
 */
function loadNotes() {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        updateDOMNotes(JSON.parse(xhr.response));
    });
    xhr.open("GET", "https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items");
    xhr.send();
}

/**
 * Updates the DOM with notes
 * 
 * @param {JSON} data 
 */
function updateDOMNotes(data) {
    const dashboard = document.getElementById("notes");
    dashboard.innerHTML = "";
    data.forEach(element => {
        const entry = createEntry(element);
        dashboard.appendChild(entry);
    });
}

/**
 * Creates an entry element.
 * 
 * @returns {HTMLElement} the entry element.
 */
function createEntry(entryData) {
    const container = document.createElement("article");
    container.setAttribute("class", "entry");
    
    const title = document.createElement("h2");
    title.textContent = entryData.title;
    
    const content = document.createElement("p");
    content.textContent = entryData.content; // TODO truncate

    // TODO add tags

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.id = "edit-note";
    // TODO add listener

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.id = "delete-note";
    deleteButton.addEventListener("click", function() {
        let xhr = new XMLHttpRequest();
        xhr.open("DELETE", `https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items/${entryData.id}`);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();
        container.remove();
    });

    container.appendChild(title);
    container.appendChild(content);
    container.appendChild(editButton);
    container.appendChild(deleteButton);
    
    return container;
}