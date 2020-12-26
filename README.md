# Quickdraw

A script that will go through a [Spyglass](https://github.com/khronion/Spyglass) sheet and automatically generate raid targets and triggers

## Usage

The tool is located [here](https://aptenodyte.github.io/Quickdraw/). The site is pretty self-explanatory, and all times are to be given in seconds. Quickdraw is now completely browser based, and as such, no longer offers a CLI app.  

After selecting your targets, you will be given the option to download two files. One is called `raidFile.txt`, and contains a list of targets and triggers organized in the following format:
```
1) target url (target update time)
    a) trigger blank template url (trigger length)
```
There is also an option to download a file called `trigger_list.txt`, which contains a list of triggers for use with [KATT](https://github.com/khronion/KATT).

## Running a local copy

It is possible to keep a local copy of Quickdraw on your own computer. To do this, switch to the `gh-pages` branch, and download a zip of the files on that branch.  

Unfortunately, Quickdraw makes use of ES6 modules, which cannot be loaded via `file://` protocol; modules must be served over HTTP(S) in order to load properly. This means that you cannot just open `index.html` and use the tool. Instead, you have to use some sort of local web-server to use Quickdraw properly, such as [static-server](https://www.npmjs.com/package/static-server#getting-started), or some similar feature in your code editor (such as [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code).

## Issues

In case of a bug or a feature request, either create an [issue](https://github.com/Aptenodyte/Quickdraw/issues), or contact me at Zizou#4903 on Discord.