import { truncateString, retrieveNotes, searchNotes, deleteNote, saveNote } from "./utils.js";

window.onload = loaded;

/**
 * Runs when the browser is finished loading.
 */
async function loaded() {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        window.location.href = "/index.html";
    }
    const greet = document.getElementById("greetUser");
    greet.textContent = sessionStorage.getItem("username");

    const serverData = await retrieveNotes(userId);
    const numNotes = Object.keys(serverData).length;
    if (numNotes < 1) {
        displayEmptyNoteSign(true);
    }
    updateDashboard(serverData);
}

const showFormButton = document.getElementById("showform");
const hideFormButton = document.getElementById("hideform");
const addNotePopup = document.getElementById("popup");
const addFilterButton = document.getElementById("filter");
const clearFilterButton = document.getElementById("clear-filter");
const emptyNotes = document.getElementById("no-notes");
const noResults = document.getElementById("no-results");

/**
 * Displays the empty note message based
 * on a boolean value.
 * 
 * @param {boolean} show display the message if
 * true, don't display it if false.
 */
function displayEmptyNoteSign(show) {
    noResults.style.display = "none";
    emptyNotes.style.display = show ? "flex" : "none";
}

/**
 * Displays the empty no search results found
 * message based on a boolean value.
 * 
 * @param {boolean} show display the message if
 * true, don't display it if false.
 */
function displayNoResultsSign(show) {
    emptyNotes.style.display = "none";
    noResults.style.display = show ? "flex" : "none";
}

/* Show the add note popup */
showFormButton.addEventListener("click", function() {
    addNotePopup.style.display = "flex";
    document.getElementById("title").focus();
});

/* Hide the add note popup */
hideFormButton.addEventListener("click", function() {
    addNotePopup.style.display = "none";
});

/* Hide the popup if the user clicks away */
document.addEventListener("click", function(event) {
    if (!addNotePopup.contains(event.target) && event.target != showFormButton) {
        addNotePopup.style.display = "none";
    }
});

/* Handles adding a search filter */
addFilterButton.addEventListener("submit", async function(event) {
    event.preventDefault();

    const textBox = document.getElementById("filterBox");
    const filterTerm = textBox.value;
    textBox.value = "";

    document.getElementById("showform").style.display = "none";
    document.getElementById("clear-filter").style.display = "inline-block";

    const resultText = document.getElementById("results");
    const searchResults = await searchNotes(sessionStorage.getItem("userId"), filterTerm);
    const numResults = Object.keys(searchResults).length;
    resultText.textContent = `Showing results for "${filterTerm}":`;
    resultText.hidden = false;

    if (numResults < 1) {
        displayNoResultsSign(true);
    }
    updateDashboard(searchResults);
});

/* Handles clearing the search filter */
clearFilterButton.addEventListener("click", async function() {
    document.getElementById("showform").style.display = "inline-block";
    document.getElementById("clear-filter").style.display = "none";

    const resultText = document.getElementById("results");
    resultText.textContent = "";
    resultText.hidden = true;
    displayNoResultsSign(false);

    const serverData = await retrieveNotes(sessionStorage.getItem("userId"));
    const numNotes = Object.keys(serverData).length;

    if (numNotes < 1) {
        displayEmptyNoteSign(true);
    }
    updateDashboard(serverData);
});

/* Logs the user out */
document.getElementById("logout").addEventListener("click", function() {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("editing");
    sessionStorage.removeItem("username");
});

/* Handles adding a new note */
document.getElementById("add-note").addEventListener("submit", async function(event) {
    event.preventDefault();

    displayEmptyNoteSign(false);
    const noteTitle = document.getElementById("title").value;
    const timeStamp = new Date();
    const noteId = crypto.randomUUID();
    document.getElementById("title").value = "";

    const dataOut = {
        "id": `${noteId}`,
        "userId": sessionStorage.getItem("userId"),
        "title": `${noteTitle}`,
        "content": "",
        "tags": [],
        "timestamp": timeStamp
    }

    saveNote(dataOut);

    addNotePopup.style.display = "none";
    document.getElementById("notes").appendChild(createEntry(dataOut));
});

/**
 * Updates the dashboard with note data.
 * 
 * @param {JSON} data data for one or more notes.
 */
function updateDashboard(data) {
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
    const container = document.createElement("section");
    container.setAttribute("class", "entry");
    
    /* Add header & note text content */
    const title = document.createElement("h2");
    title.textContent = entryData.title;
    
    const content = document.createElement("p");
    const displayLength = 50;
    content.textContent = truncateString(entryData.content, displayLength);

    /* Add the note's tags */
    const tags = document.createElement("ul");
    tags.classList.add("tags");
    entryData.tags.forEach(tag => {
        const tagItem = document.createElement("li");
        tagItem.textContent = tag;
        tags.appendChild(tagItem);
    });

    /* Add edit and delete buttons */
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.id = "edit-note";
    editButton.addEventListener("click", function() {
        sessionStorage.setItem("editing", JSON.stringify(entryData));
        window.location.href = "/editor.html";
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.id = "delete-note";
    deleteButton.addEventListener("click", function() {
        deleteNote(sessionStorage.getItem("userId"), entryData.id);
        container.remove();
        const showEmpty = !(!!document.querySelector(".entry"));
        displayEmptyNoteSign(showEmpty);
    });
    const buttonContainer = document.createElement("div");
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    /* Attach elements to the container */
    container.appendChild(title);
    container.appendChild(content);
    container.appendChild(tags);
    container.appendChild(buttonContainer);
    
    return container;
}