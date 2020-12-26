export class Region {
    constructor(regionNumber, name, updateTime, updateTimeString, isHittable) {
        this.regionNumber = regionNumber;
        this.name = name;
        this.updateTime = updateTime;
        this.updateTimeString = updateTimeString;
        this.isHittable = isHittable;
    }
}
export class TargetInfo {
    constructor(region, trigger) {
        this.region = region;
        this.trigger = trigger;
    }
}
export function initTargetFinder(regionArray) {
    const targAmount = +document.getElementById("targAmount").value;
    const minSwitchLength = +document.getElementById("minSwitch").value;
    const optimSwitchLength = +document.getElementById("optimSwitch").value;
    const minTriggerLength = +document.getElementById("minTrigger").value;
    const optimTriggerLength = +document.getElementById("optimTrigger").value;
    const maxTriggerLength = +document.getElementById("maxTrigger").value;
    let regionArrayPosition = 0;
    let amountOfTargsFound = 0;
    let targetsFound = [];
    function findTrigger() {
        const triggerProspects = [];
        let triggerPosition = regionArrayPosition;
        const targetTime = regionArray[regionArrayPosition].updateTime;
        while (targetTime - regionArray[triggerPosition].updateTime < minTriggerLength) {
            if (triggerPosition === 0)
                return undefined;
            triggerPosition--;
        }
        while (targetTime - regionArray[triggerPosition].updateTime < maxTriggerLength) {
            if (triggerPosition === 0)
                break;
            triggerProspects.push(regionArray[triggerPosition]);
            triggerPosition--;
        }
        // Sort the triggers by how close they are to the ideal trigger length
        triggerProspects.sort((triggerA, triggerB) => {
            const triggerAScore = Math.abs((targetTime - triggerA.updateTime) - optimTriggerLength);
            const triggerBScore = Math.abs((targetTime - triggerB.updateTime) - optimTriggerLength);
            return triggerAScore - triggerBScore;
        });
        // Return the one closest to the ideal trigger length
        return triggerProspects[0];
    }
    return function (prevTargAccepted) {
        if (!prevTargAccepted) {
            regionArrayPosition++;
            // Since we find all the switches between the ideal and minimum switch length,
            // if the ideal one is undesirable, we can go through the other switches we found
            if (targetsFound.length !== 0)
                return targetsFound.pop();
            else
                while (regionArray[regionArrayPosition] !== undefined) {
                    if (regionArray[regionArrayPosition].isHittable && (findTrigger() !== undefined))
                        return new TargetInfo(regionArray[regionArrayPosition], findTrigger());
                    regionArrayPosition++;
                }
        }
        else {
            targetsFound = [];
            amountOfTargsFound++;
            // If we've found all the targets, end
            if (amountOfTargsFound === targAmount)
                return undefined;
            const previousTargetUpdate = regionArray[regionArrayPosition].updateTime;
            regionArrayPosition++;
            while (regionArray[regionArrayPosition].updateTime - previousTargetUpdate < minSwitchLength) {
                if (regionArrayPosition > regionArray.length)
                    return undefined;
                regionArrayPosition++;
            }
            while (regionArray[regionArrayPosition].updateTime - previousTargetUpdate < optimSwitchLength) {
                if (regionArrayPosition > regionArray.length)
                    return undefined;
                if (regionArray[regionArrayPosition].isHittable && (findTrigger() !== undefined))
                    targetsFound.push(new TargetInfo(regionArray[regionArrayPosition], findTrigger()));
                regionArrayPosition++;
            }
            // If no switches are found between the minimum switch length and optimum
            // switch length, just grab the next switch with a trigger afterwards
            if (targetsFound.length === 0)
                while (regionArray[regionArrayPosition] !== undefined) {
                    if (regionArray[regionArrayPosition].isHittable && (findTrigger() !== undefined))
                        return new TargetInfo(regionArray[regionArrayPosition], findTrigger());
                    regionArrayPosition++;
                }
            else
                return targetsFound.pop();
            // And if we hit the end of updated, signal that update has ended
            if (regionArrayPosition > regionArray.length)
                return undefined;
        }
    };
}
//# sourceMappingURL=targetFinder.js.map