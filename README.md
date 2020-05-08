# Quickdraw
A script that will go through a Spyglass sheet and automatically generate raid targets and triggers 

## Setup

To run, download [Node.js](https://nodejs.org/en/), navigate to the project directory, and run the following:  

To install dependencies:  
`npm i opn, readline-sync, xlsx`  

To run script:  
`node quickdraw.js`  

## Use

Upon running the script, you will be given the option to select a sheet, as well as set the parameters for the raid.  
In order to save time when confirming targets, you can filter by embassies and WFE phrases. It is recommended to supply the following:  

(Comma seperated) Ignore regions that have embassies with:   
```
The Black Hawks, Doll Guldur, Frozen Circle, 3 Guys
```  

(Comma seperated) Ignore regions that have these phrases in the WFE:  
```
[url=https://www.forum.the-black-hawks.org/, [url=http://forum.theeastpacific.com,  [url=https://www.nationstates.net/page=dispatch/id=485374], [url=https://discord.gg/XWvERyc, [url=https://forum.thenorthpacific.org, [url=https://discord.gg/Tghy5kW
```  

After this, the script will open a region page in your browser, and ask you to confirm whether or not the region is a good target. This will generally be in the format of:  
`(target number). Has (target) already been tagged [y/n]:`  

At any point, you may close out of the script once you feel it has set enough targets for you. If you do not close out of the script, it will keep going until it reaches the end of the Spyglass sheet, at which point it will close itself.  

The results of the raid are saved into a file called `raidFile.txt`, and the format of the triggers is:  
```
1) target url (target update time)
    a) trigger blank template url (trigger length)
```  
It will also automatically generate a `trigger_list.txt` file, which can be used by KATT.
