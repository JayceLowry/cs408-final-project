window.onload = loaded;

/**
 * Simple Function that will be run when the browser is finished loading.
 */
async function loaded() {
    // Assign to a variable so we can set a breakpoint in the debugger!
    const hello = sayHello();
    console.log(hello);

    const userId = sessionStorage.getItem("userId");
    const editing = sessionStorage.getItem("editing");

    if (!userId) {
        window.location.href = "/pages/login.html";
    }

    if (!editing) {
        window.location.href = "/index.html";
    }

    const serverNoteData = await loadNotes();
    updateSidebar(serverNoteData);
    updateCanvas();
}

/**
 * This function returns the string 'hello'
 * @return {string} the string hello
 */
export function sayHello() {
    return 'loaded editor';
}

const saveNoteButton = document.getElementById("save");
const showTagCreateInput = document.getElementById("show-input");
const inputContainer = document.getElementById("input-container");
const hideTagCreateInput = document.getElementById("hide-input");
const createTagButton = document.getElementById("add-tag");

/* Handler for saving a note's text content */
saveNoteButton.addEventListener("submit", function(event){
    event.preventDefault();

    const editing = JSON.parse(sessionStorage.getItem("editing"));
    const newContent = document.getElementById("editor").value;

    editing.content = newContent;
    saveNote(editing);
    sessionStorage.setItem("editing", JSON.stringify(editing));
});

/* Handler for adding a new tag */
createTagButton.addEventListener("submit", async function(event){
    event.preventDefault();

    const textInput = document.getElementById("taginput");
    const text = textInput.value;
    const editor = document.getElementById("editor");
    const editorText = editor.value;

    const editing = JSON.parse(sessionStorage.getItem("editing"));
    editing.tags = new Set(editing.tags);
    editing.tags.add(text);
    editing.tags = [...editing.tags];
    sessionStorage.setItem("editing", JSON.stringify(editing));
    updateCanvas();
    editor.value = editorText;
    saveNote(editing);

    showInput(false);
});

/* Shows the tag creation form */
showTagCreateInput.addEventListener("click", function() {
    showInput(true);
});

/* Hides the tag creation form */
hideTagCreateInput.addEventListener("click", function() {
    showInput(false);
});

/**
 * Shows or hides the tag creation input form,
 * depending on a boolean value.
 * 
 * @param {boolean} isShowing true to show the form, false
 * to hide it.
 */
function showInput(isShowing) {
    const textArea = document.getElementById("taginput");
    if (isShowing) {
        inputContainer.style.display = "inline-block";
        showTagCreateInput.style.display = "none";
        textArea.focus();
    } else {
        inputContainer.style.display = "none";
        showTagCreateInput.style.display = "inline-block";
        textArea.value = "";
    }
}

/* Logs the user out */
document.getElementById("logout").addEventListener("click", function() {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("editing");
    window.location.href = "/pages/login.html";
});

/**
 * Retrieves note data from the server.
 * 
 * @returns {JSON} note data for all notes.
 */
async function loadNotes() {
    const userId = sessionStorage.getItem("userId");

    try {
        const response = await fetch(`https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items?userId=${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Error retrieving notes from the server", data.message);
        }
        return data;
    } catch (error) {
        console.log(error);
        alert("Failed to retrieve notes");
    }
}

/**
 * Retrieves a specific note.
 * 
 * @param {String} id the id for the note to retrieve.
 */
async function retrieveNote(id) {
    const userId = sessionStorage.getItem("userId");
    try {
        const response = await fetch(`https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items/${id}?userId=${userId}`, {
            Method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Error retrieving this note", data.message);
        }
        return data;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Saves the contents of a given note to the server.
 */
function saveNote(noteData) {
    try {
        fetch("https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(noteData)
        });
    } catch (error) {
        console.error(error);
        alert("Something went wrong");
    }
}

/**
 * Updates the sidebar with notes.
 * 
 * @param {JSON} data the data for one or more notes.
 */
function updateSidebar(data) {
    const sidebar = document.getElementById("sidebar");
    /* Clear existing entries */
    sidebar.innerHTML = "";

    /* Populate sidebar with new entries */
    data.forEach(element => {
        const entry = createEntry(element);
        sidebar.appendChild(entry);
    });

    /* Update the selected note */
    const editingId = JSON.parse(sessionStorage.getItem("editing")).id;
    const sidebarEntry = document.getElementById("sidebar").querySelector(`[data-id="${editingId}"]`);
    sidebarEntry.querySelector("button").classList.add("active");
}

/**
 * Creates an entry element.
 * 
 * @returns {HTMLElement} the entry element.
 */
function createEntry(entryData) {
    /* Create the container for the note */
    const container = document.createElement("section");
    container.setAttribute("class", "entry");
    container.setAttribute("data-id", entryData.id);
    
    /* Create the button element for editing */
    const editButton = document.createElement("button");
    editButton.textContent = entryData.title;
    editButton.id = "edit-note";
    editButton.classList.add("edit-note");

    editButton.addEventListener("click", async function() {
        /* Get updated note data from the server */
        const thisNote = await retrieveNote(entryData.id);

        /* Set this note as active */
        sessionStorage.setItem("editing", JSON.stringify(thisNote));
        document.querySelector(".edit-note.active")?.classList.remove("active");
        editButton.classList.add("active");
        updateCanvas();
    });

    container.appendChild(editButton);
    
    return container;
}

/**
 * Updates the text editor canvas content with the note that
 * is currently being edited.
 */
function updateCanvas() {
    /* Get the active note */
    const editing = JSON.parse(sessionStorage.getItem("editing"));

    /* Update title and text */
    const header = document.getElementById("note-title");
    const textArea = document.getElementById("editor");
    header.innerHTML = editing.title;
    textArea.value = editing.content;

    /* Load the note's tags */
    editing.tags = new Set(editing.tags);
    const tags = document.getElementById("tags");

    tags.textContent = "";
    editing.tags.forEach(tag => {
        const noteTag = document.createElement("li");
        noteTag.textContent = tag;

        const deleteTag = document.createElement("button");
        deleteTag.textContent = "+";

        deleteTag.addEventListener("click", function() {
            editing.tags = new Set(editing.tags);
            editing.tags.delete(tag);
            editing.tags = [...editing.tags];

            saveNote(editing);
            sessionStorage.setItem("editing", JSON.stringify(editing));
            noteTag.remove();
        });

        noteTag.appendChild(deleteTag);
        tags.appendChild(noteTag);
    });
    editing.tags = [...editing.tags];
}