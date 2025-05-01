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