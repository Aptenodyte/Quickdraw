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
// DO NOT try creating a Sheet object using this constructor. Use the static
// init method like so: const spyglassSheet = await Sheet.init(fileList[0]);
export class SpyglassSheet {
    // There's probably some clever way to avoid all this extra stuff, but I spent
    // 90% of my brain power on figuring out how to get Typescript to play nice
    // with xlsx over cdn, so this is what we get lol.
    constructor(workbook) {
        if (typeof workbook === "undefined")
            throw new Error("Cannot instantiate Sheet class directly, use the init method instead");
        if (workbook.SheetNames.length !== 1)
            throw new Error("Wrong amount of sheets in workbook");
        const firstSheetName = workbook.SheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];
        this.spyglassSheet = firstSheet;
        this.sheetLength = this.getSheetLength();
    }
    /**
     * Loads the given file as a Workbook, and returns a new instance of the Sheet
     * class.
     * @param sheet The workbook to extract the Spyglass sheet from
     */
    static init(sheet) {
        return __awaiter(this, void 0, void 0, function* () {
            const workbook = yield SpyglassSheet.loadSheet(sheet);
            return new SpyglassSheet(workbook);
        });
    }
    /**
     * Read the value at the given cell address for the loaded sheet
     * @param cellAddress The address of the cell being read
     */
    readCell(cellAddress) {
        const cellInSheet = this.spyglassSheet[cellAddress];
        const cellValue = (cellInSheet ? cellInSheet.v : undefined);
        return cellValue;
    }
    readTimeInSeconds(cellAddress) {
        const timeString = this.readCell(cellAddress);
        const timeComponents = timeString.split(":");
        const hourSeconds = +timeComponents[0] * 3600;
        const minuteSeconds = +timeComponents[1] * 60;
        const seconds = +timeComponents[2];
        return (hourSeconds + minuteSeconds + seconds);
    }
    getSheetLength() {
        let sheetLength = 1;
        while (this.readCell(`A${sheetLength}`) !== undefined)
            sheetLength++;
        return --sheetLength;
    }
    /**
     * Will attempt to load the given file, and parse it as a workbook
     * @param sheet The file to load in as a workbook
     */
    static loadSheet(sheet) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new FileReader();
            reader.readAsArrayBuffer(sheet);
            return new Promise(resolve => {
                reader.onload = (sheet) => {
                    const data = new Uint8Array(sheet.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    resolve(workbook);
                };
            });
        });
    }
}
//# sourceMappingURL=sheet.js.map