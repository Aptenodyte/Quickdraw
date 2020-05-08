//Initialize all modules
const fs = require("fs");
const rls = require("readline-sync");
const XLSX = require('xlsx');
const opn = require("opn");

//Declare globals
let sheetArray = [];
let targetArray = [];
const updateArray = ["Major", "Minor"];

//Iterate through all files in the directory, and add potential spyglass sheets to the sheetArray
const fileArray = fs.readdirSync(__dirname);
fileArray.forEach(file => {
  if (file.includes("SpyglassSheet" && ".xlsx")) {
    sheetArray.push(file);
  }
});

//Get raid parameters from user
const sheet = XLSX.readFile(sheetArray[rls.keyInSelect(sheetArray, "Select a sheet")]);
const minSwitch = rls.question("Minimum switch length: ");
const optimSwitch = rls.question("Optimum switch length: ");
const minTrigger = rls.question("Minimum trigger length: ");
const optimTrigger = rls.question("Optimum trigger length: ");
const maxTrigger = rls.question("Maximum trigger length: ");
const endos = rls.question("Endorsements on point: ");
let embassies = rls.question("(Comma seperated) Ignore regions that have embassies with: ").toLowerCase();
let wfeFilter = rls.question("(Comma seperated) Ignore regions that have these phrases in the WFE: ").toLowerCase();
const update = updateArray[rls.keyInSelect(updateArray, "Choose an update to run")];

//Properly split the embassy and WFE filters into an array to be used later
embassies = embassies.split(",");
for (let i = 0; i < embassies.length; i++) {
  embassies[i] = embassies[i].trim();
}
wfeFilter = wfeFilter.split(",");
for (let i = 0; i < wfeFilter.length; i++) {
  wfeFilter[i] = wfeFilter[i].trim();
}

//Get the actual name of the sheet in the excel file for use in the readCell function
const worksheet = sheet.Sheets[sheet.SheetNames[0]];
//Get the sheet length of the Spyglass sheet
const sheetLength = getSheetLength();

for (let i = 2; i < sheetLength; i++) {
  const regionName = readCell(`A${i}`);
  const regionEndos = readCell(`H${i}`);
  let regionEmbassies = readCell(`I${i}`);
  let regionWfe = readCell(`J${i}`);
  let isTarg = 1;

  //Since readCell returns undefined, ensure that empty embassies/wfe's are treated as empty strings
  if (regionEmbassies === undefined) {
    regionEmbassies = "";
  } else {
    regionEmbassies = regionEmbassies.toLowerCase();
  }
  if (regionWfe === undefined) {
    regionWfe = "";
  } else {
    regionWfe = regionWfe.toLowerCase();
  }

  //Filter out regions based on the wfe filter and embassy filter arrays
  //Use regionName.slice(-1) === "~" to check if the region is a target
  if ((regionName.slice(-1) === "~") && (regionEndos < endos)) {
    for (let itr = 0; itr < embassies.length; itr++) {
      if (regionEmbassies.includes(embassies[itr])) {
        isTarg = 0;
      }
    }
    for (let i = 0; i < wfeFilter.length; i++) {
      if (regionWfe.includes(wfeFilter[i])) {
        isTarg = 0;
      }
    }

    //Push onto the targetArray if it is determined to be a valid target
    if (isTarg) {
      if (update === "Major") {
        targetArray.push(new Target(regionName, readCell(`F${i}`), i));
      } else {
        targetArray.push(new Target(regionName, readCell(`E${i}`), i));
      }
    }
  }
}

//Create a trigger_list file that can be used with KATT, and a raidFile that contains the actual raid details
let targNumber = 1;
let url = ""
fs.writeFileSync("raidFile.txt", "");
fs.writeFileSync("trigger_list.txt", "");

//Main; Generates raidFile and trigger_list
for (let i = 0; i < targetArray.length; i++) {
  const currentTarget = targetArray[i];
  const nextTargArray = findNextSwitch(i, currentTarget.updateTime);
  let hasFoundTarg = 0;
  let prospectTargPos;
  let currentTrigger;
  let prospect;

  //Go through the switchArray generated for the currentTarget, and check if any of them have triggers
  //If they don't, use the only switchArray item
  for (let i = 0; i < nextTargArray.length; i++) {
    prospect = findInTargets(nextTargArray[i].name);
    prospectTargPos = targetArray[prospect].regionNumber;
    currentTrigger = findTriggers(prospectTargPos, targetArray[prospect].updateTime);

    //Exit the loop if we have found a trigger
    if (currentTrigger !== undefined) {
      hasFoundTarg = 1;
      break;
    }
  }

  let oldI = i;
  //Sets the hasFoundTarg flag after finding a target
  if (hasFoundTarg) {
    //Open the prospect target in browser and ask the user whether or not it's been tagged already
    i = prospect; //Push the targetArray iterator up to the switched region
    opn(`https://www.nationstates.net/region=${targetArray[i].name.slice(0, -1)}`);
    if (!rls.keyInYN(`${targNumber}. Has ${targetArray[i].name.slice(0, -1)} already been tagged: `)) {
      //Execute if the response "n" is given

      //Various formatting things for the purpose of generating links
      const targName = targetArray[i].name.slice(0, -1);
      const triggerName = ((currentTrigger.name.slice(-1) === "~") || (currentTrigger.name.slice(-1) === "*")) ? currentTrigger.name.slice(0, -1) : currentTrigger.name;

      //Add the target and trigger into raidFile, and the trigger region's into trigger_list
      if (update === "Major") {
        fs.appendFileSync("raidFile.txt", `${targNumber++}) https://www.nationstates.net/region=${targName.replace(/ /g, "_").toLowerCase()} (${readCell(`F${prospectTargPos}`)})\n`);
        fs.appendFileSync("raidFile.txt", `    a) https://www.nationstates.net/template-overall=none/region=${triggerName.replace(/ /g, "_").toLowerCase()} (${timeDifference(readCell(`F${prospectTargPos}`), readCell(`F${findInSpyglass(currentTrigger.name)}`))}s)\n\n`);
        fs.appendFileSync("trigger_list.txt", `${triggerName}\n`);
      } else {
        fs.appendFileSync("raidFile.txt", `${targNumber++}) https://www.nationstates.net/region=${targName.replace(/ /g, "_").toLowerCase()} (${readCell(`E${prospectTargPos}`)})\n`);
        fs.appendFileSync("raidFile.txt", `    a) https://www.nationstates.net/template-overall=none/region=${triggerName.replace(/ /g, "_").toLowerCase()} (${timeDifference(readCell(`E${prospectTargPos}`), readCell(`E${findInSpyglass(currentTrigger.name)}`))}s)\n\n`);
        fs.appendFileSync("trigger_list.txt", `${triggerName}\n`);
      }
    } else {
      i = oldI; //Reset the iterator back to the current targ if there is no trigger; otherwise a full switch will occur instead of prompting for the next viable targ
      i++; //If the region is already tagged,move onto the next region in the targetArray
    }
  } else {
    i++; //If no trigger can be found, move onto the next region in the targetArray
  }
}

//Reads a given cell off of the Spyglass sheet
function readCell(cell) {
  const desired_cell = worksheet[cell];
  const desired_value = (desired_cell ? desired_cell.v : undefined);
  return desired_value;
}

//A target constructor which holds the target name, it's update time, and it's row on the Spyglass sheet
function Target(name, time, row) {
  this.name = name;
  this.updateTime = time;
  this.regionNumber = row;
}

//A constructor for both switches and triggers, which holds the region's name and it's "score"
function ConstraintRegion(name, score) {
  this.name = name;
  this.score = score;
}

//Self-explanatory; gets length of Spyglass sheet by going through a while loop
function getSheetLength() {
  let sheetLength = 1;
  while (readCell(`A${sheetLength}`) !== undefined) {
    sheetLength++;
  }
  sheetLength--;
  return sheetLength;
}

//Returns the difference in seconds between two times from a spyglass sheet
function timeDifference(time1, time2) {
  const firstTimeArray = time1.split(":");
  const secondTimeArray = time2.split(":");
  const firstTimeSeconds = +(firstTimeArray[0] * 3600) + +(firstTimeArray[1] * 60) + +firstTimeArray[2];
  const secondTimeSeconds = +(secondTimeArray[0] * 3600) + +(secondTimeArray[1] * 60) + +secondTimeArray[2];
  return Math.abs(firstTimeSeconds - secondTimeSeconds);
}

//Function to create an array of viable triggers given (a target's position in the spyglass sheet, the region update's time)
//Each trigger is assigned a "score" based on how close it is to the optimum trigger length (lower = better)
//Trigger region with the lowest "score" is returned
function findTriggers(regionPosition, lastRegionUpdate) {
  let triggerArray = [];
  let i = 1;
  let prospectTime;
  if (update === "Major") {
    prospectTime = readCell(`F${regionPosition - i}`);
  } else {
    prospectTime = readCell(`E${regionPosition - i}`);
  }

  while (timeDifference(lastRegionUpdate, prospectTime) <= maxTrigger) {
    if (update === "Major") {
      prospectTime = readCell(`F${regionPosition - i}`);
    } else {
      prospectTime = readCell(`E${regionPosition - i}`);
    }
    if ((timeDifference(lastRegionUpdate, prospectTime) >= minTrigger) && (timeDifference(lastRegionUpdate, prospectTime) <= maxTrigger)) {
      triggerArray.push(new ConstraintRegion(readCell(`A${regionPosition - i}`), Math.abs(timeDifference(lastRegionUpdate, prospectTime) - optimTrigger)));
    }
    i++;
  }

  triggerArray.sort(function(a, b) {return a.score - b.score});
  return triggerArray[0];
}

//Function that will generate an array of switchable regions give (a target's position in spyglass, the region's update time)
//Uses the same "score" system as the findTriggers function
//Return the whole array, since you may be able to use other switches if one doesn't have any triggers
function findNextSwitch(targPosition, lastRegionUpdate) {
  let switchArray = [];
  let i = 1;
  if (targetArray[targPosition + i] === undefined) {
    process.kill(process.pid, "SIGTERM"); //Stop the script if you try to go past the end of the spyglass sheet
  }
  let prospectTime = targetArray[targPosition + i].updateTime;

  //Work through the targetArray until it gets past the optimal switch point
  //If any target is in between the minimum switch time, and optimal switch time, push it onto the switchArray
  while(timeDifference(lastRegionUpdate, prospectTime) <= optimSwitch) {
    prospectTime = targetArray[targPosition + i].updateTime;
    if (timeDifference(lastRegionUpdate, prospectTime) >= minSwitch) {
      switchArray.push(new ConstraintRegion(targetArray[targPosition + i].name, Math.abs(timeDifference(lastRegionUpdate, prospectTime) - optimSwitch)));
    }
    i++; //Next in targetArray
  }
  //Push an extra region onto the switchArray, since there must be a switch, even if it is slower than optimal
  prospectTime = targetArray[targPosition + i].updateTime;
  switchArray.push(new ConstraintRegion(targetArray[targPosition + i].name, Math.abs(timeDifference(lastRegionUpdate, prospectTime) - optimSwitch)));

  switchArray.sort(function(a, b) {return a.score - b.score});
  return switchArray;
}

//Find a region in the targetArray
function findInTargets(region) {
  for (let i = 0; i < targetArray.length; i++) {
    if (targetArray[i].name === region) {
      return i;
    }
  }
}

//Find a region in Spyglass sheet
function findInSpyglass(region) {
  for (let i = 0; i < sheetLength; i++) {
    if (readCell(`A${i}`) === region) {
      return i;
    }
  }
}
