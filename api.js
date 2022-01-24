/**
 * Quickdraw - A NationStates utility to help quickly organize tag raids
 * Copyright (C) 2022  Zizou
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
import { delay } from './ui.js';
export class NsApi {
    filterRegionsByTag(includeTags, excludeTags) {
        return __awaiter(this, void 0, void 0, function* () {
            // The regionsbytag shard has a limit of 10 total tags
            if (includeTags.length + excludeTags.length > 10) {
                throw new Error('Too many filter tags!');
            }
            const includeTagString = includeTags.join();
            const excludeTagString = excludeTags.map(tag => `-${tag}`).join();
            // The API doesn't give a fuck about trailing commas so I don't give a fuck either
            const url = `https://www.nationstates.net/cgi-bin/api.cgi?q=regionsbytag;tags=${includeTagString},${excludeTagString}`;
            const apiResponse = yield NsApi.apiRequest(url);
            const xmlParser = new DOMParser();
            // There's no difference between text/xml and application/xml
            const parsedResponse = xmlParser.parseFromString(apiResponse, 'text/xml');
            const parseError = parsedResponse.querySelector('parsererror');
            if (parseError !== null) {
                throw new Error('XML parsing error');
            }
            const returnedRegions = parsedResponse.getElementsByTagName('REGIONS')[0].innerHTML;
            return returnedRegions.split(',');
        });
    }
    static apiRequest(url) {
        return __awaiter(this, void 0, void 0, function* () {
            // Standard NS API compliance shit
            if (NsApi.userAgent === undefined) {
                throw new Error('Set a nation before using the API');
            }
            yield delay(600);
            const apiResponse = yield fetch(`${url}&script=${NsApi.userAgent}`);
            return yield apiResponse.text();
        });
    }
    setUA(nation) {
        const sanitizedNation = nation.trim().toLowerCase().replace(/ /g, '_');
        // If the user nation is empty for some reason
        if (sanitizedNation === '') {
            throw new Error('User nation not properly set');
        }
        // Can't set UA in browser so append a script identifier as a get parameter instead
        // Also this looks really fucking stupid since both @ and . are reserved characters
        NsApi.userAgent = `quickdraw_v_120_used_by_${sanitizedNation}_devved_by_zizou`;
    }
}
//# sourceMappingURL=api.js.map