#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const program = require('commander');
const WORKINGDIR = process.cwd();
const WILDCARD = '!';

program
  .version('2.0.0')
  .option(
    '-m, --mode <mode>',
    'The script running mode.  Batch or single file.'
  )
  .option(
    '-f, --filename <filename>',
    'The desired file name including wildcard.  i.e. filename!'
  )
  .option(
    '-t, --targetfile <target>',
    'If in single file mode, this flag must be set with the target file for the rename operation.'
  )
  .parse(process.argv);

(function() {
  if (program.mode) {
    var mode = checkMode(program.mode);

    if (mode == 'batch') {
      batchMode();
    }
    if (mode == 'single') {
      singleMode();
    }
  } else {
    console.log('The mode flag is mandatory.');
    process.exit(1);
  }
})();

/**
 * Function wrapper for the batch mode operation.
 */
function batchMode() {
  if (!validateInput(program.filename)) {
    console.log("The input must contain the '!' character.");
    process.exit(1);
  }

  ask('Rename all files and folders in: ' + WORKINGDIR + '? Y or N')
    .then(function(responseData) {
      if (
        !responseData == 'Y' ||
        !responseData == 'y' ||
        !responseData == 'N' ||
        !responseData == 'n'
      ) {
        process.exit(1);
      }
      if (responseData == 'N' || responseData == 'n') {
        process.exit(1);
      }
    })
    .then(function() {
      readDir()
        .then(
          function(files) {
            // Loop through the files array and rename each file
            for (let i = 0; i < files.length; i++) {
              // Check if files[i] is a directory, if it is, continue
              if (checkIfDirectory(files[i])) {
                continue;
              }
              //exclude the script itself from the loop.  This could be done better.  It currently counts the script file itself if it exists in the working directory.  I should find a better way to do this.
              if (files[i] === 'redress.js') {
                continue;
              }
              let fileNumber = i + 1;
              // Strip the extension before renaming.  The rename function pastes it all back together
              let fileExtension = path.extname(files[i]);
              rename(files[i], program.filename, fileNumber, fileExtension);
            }
            return;
          },
          function(err) {
            console.log(err);
            process.exit(1);
          }
        )
        .then(function() {
          console.log('Rename Done!');
          process.exit(0);
        });
    });
}

/**
 * Function wrapper for single file mode.
 */
function singleMode() {
  ask('Rename ' + program.targetfile + ' to ' + program.filename + '? Y or N')
    .then(function(responseData) {
      if (
        !responseData == 'Y' ||
        !responseData == 'y' ||
        !responseData == 'N' ||
        !responseData == 'n'
      ) {
        process.exit(1);
      }
      if (responseData == 'N' || responseData == 'n') {
        process.exit(1);
      }
    })
    .then(function() {
      readDir()
        .then(
          function(files) {
            if (files.includes(program.targetfile)) {
              let indexOfTargetFile = files.indexOf(program.targetfile);
              //strips the file extension from the supplied filename
              let newFileName = program.filename.replace(/\.[^/.]+$/, '');
              let fileExtension = path.extname(program.filename);
              rename(files[indexOfTargetFile], newFileName, '', fileExtension);
            }
          },
          function(err) {
            console.log(err);
            process.exit(1);
          }
        )
        .then(function() {
          console.log('Rename Done!');
          process.exit(0);
        });
    });
}
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
    });
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
  });
}

/**
 * Used to validate the user input. Ensures the wildcard character is present. Script will fail to batch rename if wildcard is not present in the string.
 * @param {string} string
 * @returns {boolean} True if the wildcard string is present in the input string. False if not.
 */
function validateInput(input) {
  if (!input) {
    console.log('No file name given.');
    process.exit(1);
  }
  let wildcardExists = input.includes(WILDCARD);
  return wildcardExists;
}

/**
 * Function to ask questions of the user.  This is used for prompting the user before performing the final rename operation.
 * @param {string} question
 * @returns {Promise} The promise resolves to the supplied input from the user when prompted.
 */
function ask(question) {
  let stdIn = process.stdin;
  let stdOut = process.stdout;
  return new Promise(function(resolve, reject) {
    stdIn.resume();
    stdOut.write(question + '\n');
    stdIn.once('data', function(data) {
      data = data.toString().trim();
      resolve(data);
    });
  });
}

/**
 * Checks which mode flag was set by the user.
 * @param {string} mode Mode can be "b" for batch mode, or "s" for single.
 * @returns {string} Returned string represents the run mode for the program.  Either batch or single file.  If an invalid run mode flag is set, the program exits with a logged error message.
 */
function checkMode(mode) {
  let runMode;
  switch (mode) {
    case 'b':
      runMode = 'batch';
      break;
    case 's':
      runMode = 'single';
      break;
  }
  if (!runMode) {
    console.log('Error: invalid mode');
    process.exit(1);
  }
  return runMode;
}

/**
 * Checks if the given name is a directory.
 * @param {string} name The name to be checked.
 * @returns {boolean} Whether or not the name is a directory.
 */
function checkIfDirectory(name) {
  if (fs.statSync(name).isDirectory()) {
    return true;
  } else {
    return false;
  }
}
