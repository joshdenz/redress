#!/usr/bin/env node
'use strict'
console.log('Script is working');
/**
 * Include Commander from npm to better handle input.  Standing on the shoulders of giants and all that.
 */
const fs = require('fs');
const path = require('path');
const program = require('commander');
const WORKINGDIR = process.cwd();
const WILDCARD = "!";
var args = process.argv.slice(2);
var renameString = args[0];

program
    .version('0.0.1')
    .option('-m, --mode <mode>', 'The script running mode.  Batch or single file.')
    .option('-f, --filename <filename>', 'The desired file name including wildcard.  i.e. filename!')
    .option('-t, --targetfile <target>', 'If in single file mode, this flag must be set with the target file for the rename operation.')
    .parse(process.argv);

(function () {
    if (!validateInput(renameString)) {
        console.log("The input must contain the '!' character.");
        process.exit(1);
    }

    ask("Rename all files and folders in: " + WORKINGDIR + " ? \n Y or N")
        .then((responseData) => {
            if (!responseData == "Y" || !responseData == "y" || !responseData == "N" || !responseData == "n") {
                process.exit(1);
            }
            if (responseData == "N" || responseData == "n") {
                process.exit(1);
            }
        })
        .then(() => {
            readDir()
                .then(function(files) {
                    for (let i = 0; i < files.length; i++) {
                        //exclude the script itself from the loop.  This could be done better.  It currently counts the script file itself if it exists in the working directory.  I should find a better way to do this.
                        if (files[i] === "rename.js") {
                            continue;
                        }
                        let fileNumber = i + 1;
                        let fileExtension = path.extname(files[i]);
                        rename(files[i], renameString, fileNumber, fileExtension);
                    }
                    return;
                })
                .then(function() {
                    console.log("Rename Done!");
                    process.exit();
                })
        })
})();

/**
 * Reads the directory where the script was executed and returns a promise that will resolve to an array of file names.
 * @returns {Promise} A promise that resolves to an array containing the directory contents.
 */
function readDir() {
    return new Promise(function(resolve, reject) {
        fs.readdir(WORKINGDIR, function(err, files) {
            if (err) {
                reject(err);
            }

            resolve(files);
        })
    });
}

/**
 * Renames the file, keeping the extension of the file the same.  Adds wildcard for numbering files.
 * @param {string} file The file name to be changed.
 * @param {string} nmstring The string including wildcard char "!" that the file param will be renamed to.
 * @param {string} wildcard This is the char that the wildcard char will be replaced with.
 * @param {string} extension This is the extension of the file being passed in.  Must be supplied.
 */
function rename(file, nmstring, fileNumber, extension) {
    let newFileNameWithoutExt = nmstring.replace(/\!/gi, fileNumber);
    let newFileNameWithExt = newFileNameWithoutExt + extension;
    fs.rename(file, newFileNameWithExt, function(err) {
        if (err) {
            console.log(err);
        }
    })
}

/**
 * Used to validate the user input. Ensures the wildcard character is present. Script will fail to batch rename if wildcard is not present in the string.
 * @param {string} string
 * @returns {boolean} True if the wildcard string is present in the input string. False if not.
 */
function validateInput(input) {
    var input = input.includes(WILDCARD);
    return input;
}

/**
 * Function to ask questions of the user.
 * @param {string} question 
 * @returns {Promise} The promise resolves to the supplied input from the user when prompted.
 */
function ask(question) {
    let stdIn = process.stdin;
    let stdOut = process.stdout;
    return new Promise(function(resolve, reject) {
        stdIn.resume();
        stdOut.write(question + "\n");
        stdIn.once('data', (data) => {
            data = data.toString().trim();
            resolve(data);
        })
    })
}