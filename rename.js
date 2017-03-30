#!/usr/bin/env node
'use strict'
console.log('Script is working');

const fs = require('fs');
const path = require('path');
const WORKINGDIR = process.cwd();
const WILDCARD = "!";
var args = process.argv.slice(2);
var renameString = args[0];

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
                .then((files) => {
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
                .then(() => {
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
    return new Promise((resolve, reject) => {
        fs.readdir(WORKINGDIR, (err, files) => {
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
    fs.rename(file, newFileNameWithExt, (err) => {
        if (err) {
            console.log(err);
        }
    })
}

/**
 * Used to validate the user input. Ensures the wildcard character is present. Script will fail to batch rename if wildcard is not present in the string.
 * @param {string} string
 * @returns {boolean}  
 */
function validateInput(input) {
    var input = input.includes(WILDCARD);
    return input;
}

/**
 * 
 * @param {string} question 
 */
function ask(question) {
    let stdIn = process.stdin;
    let stdOut = process.stdout;
    return new Promise((resolve, reject) => {
        stdIn.resume();
        stdOut.write(question + "\n");
        stdIn.once('data', (data) => {
            data = data.toString().trim();
            resolve(data);
        })
    })
}