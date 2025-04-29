window.onload = loaded;

/**
 * Simple Function that will be run when the browser is finished loading.
 */
async function loaded() {
    // Assign to a variable so we can set a breakpoint in the debugger!
    const hello = sayHello();
    console.log(hello);
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        window.location.href = "/pages/login.html";
    }

    const serverData = await loadNotes();
    updateDashboard(serverData);
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
const addFilterButton = document.getElementById("filter");
const clearFilterButton = document.getElementById("clear-filter");

/* Show the add note popup */
showFormButton.addEventListener("click", function() {
    addNotePopup.style.display = "block";
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

    const searchResults = await searchNotes(filterTerm);
    updateDashboard(searchResults);
});

/* Handles clearing the search filter */
clearFilterButton.addEventListener("click", async function() {
    document.getElementById("showform").style.display = "inline-block";
    document.getElementById("clear-filter").style.display = "none";
    const serverData = await loadNotes();
    updateDashboard(serverData);
});

/* Logs the user out */
document.getElementById("logout").addEventListener("click", function() {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("editing");
    window.location.href = "/pages/login.html";
});

/* Handles adding a new note */
document.getElementById("add-note").addEventListener("submit", async function(event) {
    event.preventDefault();

    const noteTitle = document.getElementById("title").value;
    const timeStamp = Date.now();
    const noteId = crypto.randomUUID();
    document.getElementById("title").value = "";

    const dataOut = {
        "id": `${noteId}`,
        "userId": sessionStorage.getItem("userId"),
        "title": `${noteTitle}`,
        "content": "",
        "tags": [],
        "timestamp": `${timeStamp}`
    }

    try {
        fetch("https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataOut)
        });
    } catch (error) {
        console.error(error);
        alert("Something went wrong");
    }

    addNotePopup.style.display = "none";
    document.getElementById("notes").appendChild(createEntry(dataOut));
});

/**
 * Retrieves notes from the server.
 * 
 * @returns {JSON} note data.
 */
async function loadNotes() {
    const userId = sessionStorage.getItem("userId");
    try {
        const response = await fetch(`https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items?userId=${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await response.json();

        if (!response.ok) {
            alert("Failed to load notes");
            throw new Error("Load failure");
        }
        return data;

    } catch (error) {
        console.error(error);
    }
}

/**
 * Retrieves notes from the server whose
 * tags match a given search filter term.
 * 
 * @param {String} filter the filter/search term.
 * @returns {JSON} note data.
 */
async function searchNotes(filter) {
    const userId = sessionStorage.getItem("userId");
    try {
        const response = await fetch(`https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items/search/${filter}?userId=${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await response.json();

        if (!response.ok) {
            alert("Failed to load notes");
            throw new Error("Load failure");
        }
        return data;

    } catch (error) {
        console.error(error);
    }
}

/**
 * Deletes a note from the server with a given id.
 * 
 * @param {String} id the id for the note
 * to delete.
 */
async function deleteNote(id) {
    const userId = sessionStorage.getItem("userId");
    try {
        fetch(`https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items/${id}?userId=${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
        });
    } catch (error) {
        console.error(error);
    }
}

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
    content.textContent = (entryData.content.length > displayLength) ? entryData.content.slice(0, displayLength) + "..." : entryData.content;

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
        window.location.href = "pages/editor.html";
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.id = "delete-note";
    deleteButton.addEventListener("click", function() {
        deleteNote(entryData.id);
        container.remove();
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