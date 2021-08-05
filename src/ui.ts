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

/**
 * Fills the default embassy filters for the "Ignore Embassies" field
 */
export function fillDefaultEmbassies (): void {
  const DEFAULT_EMBASSY_FILTERS = [
    'The Black Hawks',
    'Doll Guldur',
    'Frozen Circle',
    '3 Guys',
    'Plum Island',
    'The Autumnal Court'
  ]
  const ignoreEmbassiesField = document.getElementById('ignoreEmbassies')! as HTMLInputElement
  ignoreEmbassiesField.value = DEFAULT_EMBASSY_FILTERS.join(', ')
}

/**
 * Fills the default WFE filters for the "Ignore phrases" field
 */
export function fillDefaultPhrases (): void {
  const DEFAULT_PHRASE_FILTERS = [
    'https://www.forum.the-black-hawks.org', // Exclude the TBH forums
    'http://forum.theeastpacific.com', // Exclude the TEP forums
    'https://www.nationstates.net/page=dispatch/id=485374', // Exclude the NPA advertisement dispatch
    'https://discord.gg/XWvERyc', // Exclude the TBH Discord server
    'https://forum.thenorthpacific.org', // Exclude the TNP forums
    'https://discord.gg/Tghy5kW', // Exclude the 3 Guys Discord
    'https://www.westpacific.org', // Exclude TWP forums
    'https://discord.gg/y4wrfg8', // Exclude Lily Discord
    'https://discord.gg/m7qW9AS', // Exclude alt Lily Discord
    'https://lilystates.proboards.com', // Exclude Lily forums
    'https://forums.europeians.com/index.php', // Exclude the Euro forums
    'https://discord.gg/nYAwZ7f' // Exclude Euro Discord
  ]

  const ignorePhrasesField = document.getElementById('ignorePhrases')! as HTMLInputElement
  ignorePhrasesField.value = DEFAULT_PHRASE_FILTERS.join(', ')
}

export function toggleThornInputs (): void {
  const thornInputDiv = document.getElementsByClassName('thornInputs')!
  for (const element of thornInputDiv) {
    if (element.hasAttribute('hidden')) {
      element.removeAttribute('hidden')
    } else {
      element.setAttribute('hidden', '')
    }
  }
}

/**
 * Fills the given progress bar to the specified percentage
 * @param bar The progress bar to alter
 * @param percentage The percentage of the progress bar that should be filled
 */
export function updateProgressBar (bar: HTMLDivElement, percentage: number): void {
  bar.style.width = `${percentage}%`
  bar.innerText = `${percentage}%`
  bar.setAttribute('aria-valuenow', percentage.toString())
  if (percentage === 100) { bar.classList.remove('progress-bar-striped', 'progress-bar-animated') }
}

/**
 * A function that has an asynchronous delay of the given amount of milliseconds
 * @param ms The milliseconds to delay for
 */
export async function delay (ms: number): Promise<void> {
  return await new Promise(resolve => setTimeout(resolve, ms))
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
export function updateModal (updatePercentage: number, targetNumber: number, targetUrl: string, targetUpdate: string, triggerUrl: string, triggerLen: number): void {
  const updateProgress = document.getElementById('updateProgress')! as HTMLSpanElement
  updateProgress.innerText = updatePercentage.toString()
  const targetNum = document.getElementById('targetNum')! as HTMLSpanElement
  targetNum.innerText = targetNumber.toString()

  const targetLinkAnchor = document.getElementById('targetLinkAnchor')! as HTMLAnchorElement
  targetLinkAnchor.textContent = targetUrl
  targetLinkAnchor.href = targetUrl
  const targetTime = document.getElementById('targetTime')! as HTMLSpanElement
  targetTime.innerText = targetUpdate

  const triggerLinkAnchor = document.getElementById('triggerLinkAnchor')! as HTMLAnchorElement
  triggerLinkAnchor.textContent = triggerUrl
  triggerLinkAnchor.href = triggerUrl
  const triggerLength = document.getElementById('triggerLength')! as HTMLSpanElement
  triggerLength.innerText = triggerLen.toString()
}

export function sanitize (text: string): string {
  return text.trim().replace(/ /g, '_').toLowerCase()
}
