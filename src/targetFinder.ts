/**
 * Quickdraw - A NationStates utility to help quickly organize tag raids
 * Copyright (C) 2021  Zizou
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

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export class Region {
  constructor (
    public readonly regionNumber: number,
    public readonly name: string,
    public readonly updateTime: number,
    public readonly updateTimeString: string,
    public readonly isHittable: boolean
  ) {}
}

export class TargetInfo {
  constructor (
    public readonly region: Region,
    public readonly trigger: Region
  ) {}
}

export function initTargetFinder (regionArray: Region[]): (prevTargAccepted: boolean) => TargetInfo | undefined {
  const targAmount = +(document.getElementById('targAmount')! as HTMLInputElement).value
  const minSwitchLength = +(document.getElementById('minSwitch')! as HTMLInputElement).value
  const optimSwitchLength = +(document.getElementById('optimSwitch') as HTMLInputElement).value
  const minTriggerLength = +(document.getElementById('minTrigger')! as HTMLInputElement).value
  const optimTriggerLength = +(document.getElementById('optimTrigger')! as HTMLInputElement).value
  const maxTriggerLength = +(document.getElementById('maxTrigger')! as HTMLInputElement).value

  let regionArrayPosition = 0
  let amountOfTargsFound = 0
  let targetsFound: TargetInfo[] = []

  function findTrigger (): Region | undefined {
    const triggerProspects: Region[] = []
    let triggerPosition = regionArrayPosition
    const targetTime = regionArray[regionArrayPosition].updateTime

    while (targetTime - regionArray[triggerPosition].updateTime < minTriggerLength) {
      if (triggerPosition === 0) { return undefined }
      triggerPosition--
    }

    while (targetTime - regionArray[triggerPosition].updateTime < maxTriggerLength) {
      if (triggerPosition === 0) { break }
      triggerProspects.push(regionArray[triggerPosition])
      triggerPosition--
    }

    // Sort the triggers by how close they are to the ideal trigger length
    triggerProspects.sort((triggerA, triggerB) => {
      const triggerAScore = Math.abs((targetTime - triggerA.updateTime) - optimTriggerLength)
      const triggerBScore = Math.abs((targetTime - triggerB.updateTime) - optimTriggerLength)
      return triggerAScore - triggerBScore
    })

    // Return the one closest to the ideal trigger length
    return triggerProspects[0]
  }

  return function (prevTargAccepted: boolean) {
    if (!prevTargAccepted) {
      regionArrayPosition++
      // Since we find all the switches between the ideal and minimum switch length,
      // if the ideal one is undesirable, we can go through the other switches we found
      if (targetsFound.length !== 0) { return targetsFound.pop() } else {
        while (regionArray[regionArrayPosition] !== undefined) {
          if (regionArray[regionArrayPosition].isHittable && (findTrigger() !== undefined)) {
            return new TargetInfo(regionArray[regionArrayPosition], findTrigger()!)
          }
          regionArrayPosition++
        }
      }
    } else {
      targetsFound = []
      amountOfTargsFound++
      // If we've found all the targets, end
      if (amountOfTargsFound === targAmount) { return undefined }
      const previousTargetUpdate = regionArray[regionArrayPosition].updateTime
      regionArrayPosition++

      while (regionArray[regionArrayPosition].updateTime - previousTargetUpdate < minSwitchLength) {
        if (regionArrayPosition > regionArray.length) { return undefined }
        regionArrayPosition++
      }

      while (regionArray[regionArrayPosition].updateTime - previousTargetUpdate < optimSwitchLength) {
        if (regionArrayPosition > regionArray.length) { return undefined }
        if (regionArray[regionArrayPosition].isHittable && (findTrigger() !== undefined)) {
          targetsFound.push(new TargetInfo(regionArray[regionArrayPosition], findTrigger()!))
        }
        regionArrayPosition++
      }

      // If no switches are found between the minimum switch length and optimum
      // switch length, just grab the next switch with a trigger afterwards
      if (targetsFound.length === 0) {
        while (regionArray[regionArrayPosition] !== undefined) {
          if (regionArray[regionArrayPosition].isHittable && (findTrigger() !== undefined)) {
            return new TargetInfo(regionArray[regionArrayPosition], findTrigger()!)
          }
          regionArrayPosition++
        }
      } else {
        return targetsFound.pop()
      }
      // And if we hit the end of updated, signal that update has ended
      if (regionArrayPosition > regionArray.length) { return undefined }
    }
  }
}
