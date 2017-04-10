# redress

A cli renaming tool written in node.  Why not?

## Installation

To install:
```
npm install redress -g
```
This tool prefers the global flag.

## Usage 

Redress commands consist of a mode flag and one or more file names.

Redress includes a batch renaming mode and a single file renaming mode.  I am aware 
that there are native ways to rename single files.  Use those if you want, 
the single file mode was more of a tacked on addition.

You include the "-m" flag along with either a "b" or "s" to specify the usage mode.
```
redress -m b

or 

redress -m s
```

In either mode, you must run the command from the location of the file(s) you wish to rename.

### Batch Mode

In batch mode you include the file name format you would like the files to be renamed as.  Include the wildcard character "!".

Example:

A directory containing files like so:
```
randomfile.jpg
evenmorerandom.jpg
124144123.jpg
1023003010.jpg
```
Could be renamed using redress by navigating to the directory and using the following command:
```
redress -m b -f JuneVacation!
```
The result would be the following:
```
JuneVacation1.jpg
JuneVacation2.jpg
JuneVacation3.jpg
JuneVacation4.jpg
```

### Single File Mode

In single file mode, you include the target filename and the filename to rename as.

Example:

```
redress -m s -t targetFile.html -f newFileName.html
```

## Supported Flags

The following flags are supported by redress.

```
-m "This flag tells redress what mode you are using.  Mandatory flag.  
    Expects either "b" for batch mode, or "s" for single file mode."

-f "This flag should be followed by the string you wish to rename the file(s).  
    If in batch mode also include the wildcard character "!".  
    If in single file mode, the filename must include a file extension."
    Example: -f example! in batch mode, or -f example.txt in single file mode.

-t "This flag is only used in single file mode, and specifies the target 
    file for renaming including the file extension."
    Example: -t example.txt
```