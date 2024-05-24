function removeLineBreaks(string) {
    // remove all line breaks from the string
    return string.replace(/(\r\n|\n|\r)/gm, "");
}

module.exports = removeLineBreaks;