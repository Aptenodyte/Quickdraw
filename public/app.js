/**
 * Quickdraw - A NationStates utility to help quickly organize tag raids
 * Copyright (C) 2020  Zizou
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as ui from "./ui.js";
import { SpyglassSheet } from "./sheet.js";
import { Region, initTargetFinder } from "./targetFinder.js";
setup();
// The confirmation modal instance must be passed into this function. 
// Otherwise, there is no way of closing it.
function initModalUpdater(confirmationModal, updateLength, targetFinder) {
    let i = 1;
    let prevRegionUrl;
    let prevRegionUpdateTime;
    let prevTriggerName;
    let prevTriggerUrl;
    let prevTriggerLength;
    let raidFileText = "";
    let triggerListText = "";
    return function updateModal(prevTargAccepted) {
        if (prevTargAccepted) {
            raidFileText += `${i}) ${prevRegionUrl} (${prevRegionUpdateTime})\n\ta) ${prevTriggerUrl} (${prevTriggerLength}s)\n\n`;
            triggerListText += `${prevTriggerName}\n`;
            i++;
        }
        const targetSearchResults = targetFinder(prevTargAccepted);
        if (targetSearchResults === undefined) {
            const downloadModalDiv = document.getElementById("raidDl");
            const downloadModal = new bootstrap.Modal(downloadModalDiv, {
                backdrop: "static"
            });
            const dlRaidFile = document.getElementById("dlRaidFile");
            const raidFileBlob = new Blob([raidFileText], { type: "text/plain;charset=utf-8" });
            dlRaidFile.addEventListener("click", () => saveAs(raidFileBlob, "raidFile.txt"));
            const dlTriggerList = document.getElementById("dlTriggerList");
            const triggerListBlob = new Blob([triggerListText], { type: "text/plain;charset=utf-8" });
            dlTriggerList.addEventListener("click", () => saveAs(triggerListBlob, "trigger_list.txt"));
            confirmationModal.hide();
            downloadModal.show();
            // Reload the window after we're done downloading because every time
            // there will always be somebody who tries to run the program again after
            // running it once. When that happens, everything fucking breaks, an
            // orphan dies in a blood sacrifice ritual to a cult, and I burn my
            // fingers off in liquid nitrogen.
            downloadModalDiv.addEventListener("hidden.bs.modal", () => window.location.reload());
            return;
        }
        const { region, trigger } = targetSearchResults;
        const regionUrl = `https://www.nationstates.net/region=${ui.sanitize(region.name)}`;
        prevRegionUrl = regionUrl;
        prevRegionUpdateTime = region.updateTimeString;
        const triggerUrl = `https://www.nationstates.net/template-overall=none/region=${ui.sanitize(trigger.name)}`;
        prevTriggerName = trigger.name;
        prevTriggerUrl = triggerUrl;
        const triggerLength = region.updateTime - trigger.updateTime;
        prevTriggerLength = triggerLength;
        window.open(regionUrl, "_blank");
        ui.updateModal(Math.round((region.regionNumber / updateLength) * 100), i, regionUrl, region.updateTimeString, triggerUrl, triggerLength);
    };
}
function main(ev) {
    return __awaiter(this, void 0, void 0, function* () {
        ev.preventDefault();
        const updateSelector = document.getElementById("updateTime");
        const updatePeriod = updateSelector.value;
        if (updatePeriod === "Choose update")
            throw new Error("Please select an update");
        const endoCountInput = document.getElementById("endoCount");
        const endoCount = +endoCountInput.value;
        const embassyFiltersInput = document.getElementById("ignoreEmbassies");
        const embassyFilters = embassyFiltersInput.value.split(",").map(filter => filter.trim().toLowerCase());
        const wfeFiltersInput = document.getElementById("ignorePhrases");
        const wfeFilters = wfeFiltersInput.value.split(",").map(filter => filter.trim());
        const doApplyWfeFilters = (wfeFilters.length === 1) && (wfeFilters[0] === "");
        const doApplyEmbassyFilters = (embassyFilters.length === 1) && (embassyFilters[0] === "");
        const spyglassSheetInput = document.getElementById("spyglassSheetInput");
        if (spyglassSheetInput.files.length !== 1)
            throw new Error("Incorrect amount of files provided");
        const spyglassSheet = yield SpyglassSheet.init(spyglassSheetInput.files[0]);
        const nameColumn = "A";
        const updateTimeColumn = (updatePeriod === "major") ? "F" : "E";
        const delEndosColumn = "H";
        const embassiesColumn = "I";
        const wfeColumn = "J";
        const regionArray = [];
        for (let i = 2; i < spyglassSheet.sheetLength; i++) {
            const regionNameCell = spyglassSheet.readCell(`${nameColumn}${i}`);
            let regionName;
            const regionUpdateTime = spyglassSheet.readTimeInSeconds(`${updateTimeColumn}${i}`);
            const regionUpdateTimeString = spyglassSheet.readCell(`${updateTimeColumn}${i}`);
            if (regionNameCell.slice(-1) === "~" || regionNameCell.slice(-1) === "*")
                regionName = regionNameCell.slice(0, -1);
            else
                regionName = regionNameCell;
            if (regionNameCell.slice(-1) !== "~") {
                regionArray.push(new Region(i - 1, regionName, regionUpdateTime, regionUpdateTimeString, false));
                continue;
            }
            const delEndos = +spyglassSheet.readCell(`${delEndosColumn}${i}`);
            if (endoCount <= delEndos) {
                regionArray.push(new Region(i - 1, regionName, regionUpdateTime, regionUpdateTimeString, false));
                continue;
            }
            if (!doApplyWfeFilters) {
                const regionWfe = spyglassSheet.readCell(`${wfeColumn}${i}`);
                // Ensure that no issues are cause by empty cells
                if (regionWfe !== undefined) {
                    let isHittable = true;
                    for (const filter of wfeFilters)
                        if (regionWfe.includes(filter)) {
                            isHittable = false;
                            break;
                        }
                    if (!isHittable) {
                        regionArray.push(new Region(i - 1, regionName, regionUpdateTime, regionUpdateTimeString, false));
                        continue;
                    }
                }
            }
            if (!doApplyEmbassyFilters) {
                const regionEmbassiesString = spyglassSheet.readCell(`${embassiesColumn}${i}`);
                // Fix glitch caused by empty embassy cells on regions without embassies
                if (regionEmbassiesString === undefined) {
                    regionArray.push(new Region(i - 1, regionName, regionUpdateTime, regionUpdateTimeString, true));
                    continue;
                }
                const regionEmbassies = regionEmbassiesString.split(",").map(embassy => embassy.toLowerCase());
                const forbiddenEmbassies = embassyFilters.filter(embassy => regionEmbassies.includes(embassy));
                regionArray.push(new Region(i - 1, regionName, regionUpdateTime, regionUpdateTimeString, forbiddenEmbassies.length === 0));
            }
            else {
                regionArray.push(new Region(i - 1, regionName, regionUpdateTime, regionUpdateTimeString, true));
            }
        }
        const targetFinder = initTargetFinder(regionArray);
        const targetConfirmationModalDiv = document.getElementById("targetConfirm");
        const targetConfirmationModal = new bootstrap.Modal(targetConfirmationModalDiv, {
            backdrop: "static",
            keyboard: false
        });
        const updateModal = initModalUpdater(targetConfirmationModal, regionArray.length, targetFinder);
        const acceptTargetButton = document.getElementById("acceptTarget");
        const declineTargetButton = document.getElementById("declineTarget");
        acceptTargetButton.addEventListener("click", updateModal.bind(null, true));
        declineTargetButton.addEventListener("click", updateModal.bind(null, false));
        updateModal(false);
        targetConfirmationModal.show();
    });
}
function setup() {
    // Ensure that all uncaught errors can be properly displayed to the user
    window.onerror = function (message, url, line, col) {
        alert(`${message}\n At ${line}:${col} of ${url}\n Please check the console for the full error`);
    };
    // And unhandled promise rejections too
    window.onunhandledrejection = (event) => {
        alert(`${event.reason}\n Please check the console for the full error`);
    };
    const fillDefaultEmbassiesButton = document.getElementById("embassyDefaults");
    const fillDefaultPhrasesButton = document.getElementById("phraseDefaults");
    fillDefaultEmbassiesButton.addEventListener("click", ui.fillDefaultEmbassies);
    fillDefaultPhrasesButton.addEventListener("click", ui.fillDefaultPhrases);
    const mainForm = document.getElementById("mainForm");
    mainForm.addEventListener("submit", main);
}
//# sourceMappingURL=app.js.map