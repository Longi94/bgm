import { Pipe, PipeTransform } from '@angular/core';
import { BoardGame } from './boardgame';

export type PlayerCountFilterMode = 'playable' | 'recommended' | 'best';
export type SortDirection = 'asc' | 'desc';
export type SortType = 'alphabetical' | 'rating' | 'weight' | 'publicationyear'

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: BoardGame[], searchText: string, playerCount: string,
    playerCountFilterMode: PlayerCountFilterMode, sort: SortType,
    sortDirection: SortDirection): BoardGame[] {
    // return empty array if array is falsy
    if (!items) { return []; }

    // convert the searchText to lower case
    searchText = searchText.toLowerCase();

    const playerCountNumber = playerCount ? parseInt(playerCount) : 0;

    items = items.filter(item => {
      // filter search
      if (searchText && !item.name?.toLowerCase().includes(searchText)) {
        return false;
      }

      // filter player number
      if (playerCountNumber) {

        const countVotes = item.suggested_numplayers?.find(s => {
          return (s.numplayers.indexOf('+') >= 0 && parseInt(s.numplayers.slice(0, s.numplayers.length - 1))) ||
            parseInt(s.numplayers) === playerCountNumber;
        });
        if (countVotes === undefined) {
          return false;
        }
        switch (playerCountFilterMode) {
          case 'best':
            if (countVotes.best <= countVotes.not_recomended || countVotes.best <= countVotes.recommended) {
              return false;
            }
            break;
          case 'recommended':
            if (countVotes.best + countVotes.recommended <= countVotes.not_recomended) {
              return false;
            }
            break;
          case 'playable':
            if ((item.minplayers ?? Number.MAX_VALUE) > playerCountNumber || (item.maxplayers ?? 0) < playerCountNumber) {
              return false;
            }
            break;
        }
      }

      return true;
    });

    // sort
    switch (sort) {
      case 'alphabetical':
        items.sort((a, b) => {
          if (a.name < b.name) {
            return sortDirection === 'asc' ? -1 : 1;
          }
          if (a.name > b.name) {
            return sortDirection === 'asc' ? 1 : -1;
          }
          return 0;
        });
        break;
      case 'rating':
        items.sort((a, b) => sortDirection === 'asc' ? (a.ratings?.average ?? 0) - (b.ratings?.average ?? 0) :
          (b.ratings?.average ?? 0) - (a.ratings?.average ?? 0));
        break;
      case 'weight':
        items.sort((a, b) => sortDirection === 'asc' ? (a.ratings?.averageweight ?? 0) - (b.ratings?.averageweight ?? 0) :
          (b.ratings?.averageweight ?? 0) - (a.ratings?.averageweight ?? 0));
        break;
      case 'publicationyear':
        items.sort((a, b) => {
          if ((a.yearpublished ?? '') < (b.yearpublished ?? '')) {
            return sortDirection === 'asc' ? -1 : 1;
          }
          if ((a.yearpublished ?? '') > (b.yearpublished ?? '')) {
            return sortDirection === 'asc' ? 1 : -1;
          }
          return 0;
        });
        break;
    }

    return items;
  }
}