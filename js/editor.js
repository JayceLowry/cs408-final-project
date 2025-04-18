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
    return 'loaded editor';
}

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
 * @param {JSON} data the JSON data for one or more notes.
 */
function updateDOMNotes(data) {
    const sidebar = document.getElementById("sidebar");
    sidebar.innerHTML = "";
    data.forEach(element => {
        const entry = createEntry(element);
        sidebar.appendChild(entry);
    });
}

/**
 * Creates an entry element.
 * 
 * @returns {HTMLElement} the entry element.
 */
function createEntry(entryData) {
    const container = document.createElement("section");
    container.setAttribute("class", "entry");
    container.setAttribute("data-id", entryData.id);
    
    const title = document.createElement("h2");
    title.textContent = entryData.title;
    
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.id = "edit-note";

    editButton.addEventListener("click", function() {
    //   updateCanvas(entryData);
        retrieveNote(entryData.id, updateCanvas);
    });

    container.appendChild(title);
    container.appendChild(editButton);
    
    return container;
}

/**
 * Retrieves a specific note.
 * 
 * @param {String} id the id for the note to retrieve.
 * @param {Function} callback an action to be performed using 
 * retrieved data as input.
 */
function retrieveNote(id, callback) {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        callback(JSON.parse(xhr.response));
    });
    xhr.open("GET", `https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items/${id}`);
    xhr.send();
}

/**
 * Updates the title and text editor content.
 * 
 * @param {JSON} data the JSON data for a single note.
 */
function updateCanvas(data) {
    const header = document.getElementById("note-title");
    header.setAttribute("data-id", data.id)
    const textArea = document.getElementById("editor");
    header.innerHTML = data.title;
    textArea.value = data.content;
}

/* Handles saving a note's text content */
document.getElementById("save").addEventListener("submit", function(event){
    event.preventDefault();

    const noteId = document.getElementById("note-title").getAttribute("data-id");
    if (noteId == null) {
        return;
    }
    const newContent = document.getElementById("editor").value;

    retrieveNote(noteId, function(data) {
        data.content = newContent;

        let xhr = new XMLHttpRequest();
        xhr.open("PUT", "https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));

        updateCanvas(data);
    });
});