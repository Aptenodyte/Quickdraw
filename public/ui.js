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
/**
 * Fills the default embassy filters for the "Ignore Embassies" field
 */
export function fillDefaultEmbassies() {
    const DEFAULT_EMBASSY_FILTERS = [
        "The Black Hawks",
        "Doll Guldur",
        "Frozen Circle",
        "3 Guys",
        "Lily"
    ];
    const ignoreEmbassiesField = document.getElementById("ignoreEmbassies");
    ignoreEmbassiesField.value = DEFAULT_EMBASSY_FILTERS.join(", ");
}
/**
 * Fills the default WFE filters for the "Ignore phrases" field
 */
export function fillDefaultPhrases() {
    const DEFAULT_PHRASE_FILTERS = [
        "https://www.forum.the-black-hawks.org",
        "http://forum.theeastpacific.com",
        "https://www.nationstates.net/page=dispatch/id=485374",
        "https://discord.gg/XWvERyc",
        "https://forum.thenorthpacific.org",
        "https://discord.gg/Tghy5kW",
        "https://www.westpacific.org",
    ];
    const ignorePhrasesField = document.getElementById("ignorePhrases");
    ignorePhrasesField.value = DEFAULT_PHRASE_FILTERS.join(", ");
}
/**
 * Fills the given progress bar to the specified percentage
 * @param bar The progress bar to alter
 * @param percentage The percentage of the progress bar that should be filled
 */
export function updateProgressBar(bar, percentage) {
    bar.style.width = `${percentage}%`;
    bar.innerText = `${percentage}%`;
    bar.setAttribute("aria-valuenow", percentage.toString());
    if (percentage === 100)
        bar.classList.remove("progress-bar-striped", "progress-bar-animated");
}
/**
 * A function that has an asynchronous delay of the given amount of milliseconds
 * @param ms The milliseconds to delay for
 */
export function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
/**
 * Updates the target confirmation modal with the following parameters
 * @param updatePercentage The percent through update that the targ is in
 * @param targetNumber The number target that has been confirmed
 * @param targetUrl The url of the given target
 * @param targetUpdate The update time of the given target
 * @param triggerUrl The url of the trigger
 * @param triggerLen The lenght of the trigger
 */
export function updateModal(updatePercentage, targetNumber, targetUrl, targetUpdate, triggerUrl, triggerLen) {
    const updateProgress = document.getElementById("updateProgress");
    updateProgress.innerText = updatePercentage.toString();
    const targetNum = document.getElementById("targetNum");
    targetNum.innerText = targetNumber.toString();
    const targetLinkAnchor = document.getElementById("targetLinkAnchor");
    targetLinkAnchor.textContent = targetUrl;
    targetLinkAnchor.href = targetUrl;
    const targetTime = document.getElementById("targetTime");
    targetTime.innerText = targetUpdate;
    const triggerLinkAnchor = document.getElementById("triggerLinkAnchor");
    triggerLinkAnchor.textContent = triggerUrl;
    triggerLinkAnchor.href = triggerUrl;
    const triggerLength = document.getElementById("triggerLength");
    triggerLength.innerText = triggerLen.toString();
}
export function sanitize(text) {
    return text.trim().replace(/ /g, "_").toLowerCase();
}
//# sourceMappingURL=ui.js.map