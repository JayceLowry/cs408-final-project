/**
 * Truncates a given string to a given length.
 * 
 * @param {String} string the string to truncate.
 * @param {Number} truncationLength the length to
 * truncate the string to.
 * @returns the truncated string.
 */
export function truncateString(string, truncationLength) {
    if (truncationLength < 0) {
        return string;
    }
    const retString = (string.length > truncationLength) ? string.slice(0, truncationLength - 3) + "..." : string;
    return retString;
}

/**
 * Retrieves note data from the server for a particular
 * user.
 * 
 * @param {String} userId id for the user.
 * @returns {JSON} note data.
 */
export async function retrieveNotes(userId) {
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
 * Retrieves notes from the server authored by a particular
 * user, and whose tags match a given search filter term.
 * 
 * @param {String} userId the id for the user.
 * @param {String} filter the filter/search term.
 * @returns {JSON} note data.
 */
export async function searchNotes(userId, filter) {
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
 * @param {String} userId the id for the user who 
 * authored the note.
 * @param {String} noteId the id for the note
 * to delete.
 */
export async function deleteNote(userId, noteId) {
    try {
        fetch(`https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items/${noteId}?userId=${userId}`, {
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
 * Retrieves a specific note authored by a particular
 * user.
 * 
 * @param {String} userId the id for the author of the note.
 * @param {String} noteId the id for the note to retrieve.
 */
export async function retrieveNote(userId, noteId) {
    try {
        const response = await fetch(`https://w450sz6yzd.execute-api.us-east-2.amazonaws.com/items/${noteId}?userId=${userId}`, {
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
export function saveNote(noteData) {
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