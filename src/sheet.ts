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

import { CellObject, WorkBook, WorkSheet } from "xlsx/types";

declare const XLSX: typeof import("xlsx");

// DO NOT try creating a Sheet object using this constructor. Use the static
// init method like so: const spyglassSheet = await Sheet.init(fileList[0]);
export class SpyglassSheet {
  private readonly spyglassSheet: WorkSheet;
  public readonly sheetLength: number;

  // There's probably some clever way to avoid all this extra stuff, but I spent
  // 90% of my brain power on figuring out how to get Typescript to play nice
  // with xlsx over cdn, so this is what we get lol.
  constructor(workbook: WorkBook) {
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
  static async init(sheet: File): Promise<SpyglassSheet> {
    const workbook = await SpyglassSheet.loadSheet(sheet);
    return new SpyglassSheet(workbook);
  }

  /**
   * Read the value at the given cell address for the loaded sheet
   * @param cellAddress The address of the cell being read
   */
  readCell(cellAddress: string): string | number | boolean | Date | undefined {
    const cellInSheet = this.spyglassSheet[cellAddress] as CellObject;
    const cellValue = (cellInSheet ? cellInSheet.v : undefined);
    return cellValue;
  }

  readTimeInSeconds(cellAddress: string): number {
    const timeString = this.readCell(cellAddress) as string;
    const timeComponents = timeString.split(":");
    const hourSeconds = +timeComponents[0] * 3600;
    const minuteSeconds = +timeComponents[1] * 60;
    const seconds = +timeComponents[2];
    return (hourSeconds + minuteSeconds + seconds);
  }

  private getSheetLength(): number {
    let sheetLength = 1;
    while (this.readCell(`A${sheetLength}`) !== undefined)
      sheetLength++;
    return --sheetLength;
  }

  /**
   * Will attempt to load the given file, and parse it as a workbook
   * @param sheet The file to load in as a workbook
   */
  private static async loadSheet(sheet: File): Promise<WorkBook> {
    const reader = new FileReader();
    reader.readAsArrayBuffer(sheet);
    
    return new Promise(resolve => {
      reader.onload = (sheet) => {
        const data = new Uint8Array(sheet.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, {type: "array"});
        resolve(workbook);
      };
    });
  }
}