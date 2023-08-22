export interface BoardGame {
  id: string;
  image?: string;
  name: string;
  numplays?: string;
  thumbnail?: string;
  categories?: string[];
  description?: string;
  maxplayers?: number;
  maxplaytime?: number;
  mechanics?: string[];
  minplayers?: number;
  minplaytime?: number;
  ratings?: Ratings;
  suggested_numplayers?: SuggestedPlayers[];
  yearpublished?: string;
}

export interface Ratings {
  average: number;
  averageweight: number;
}

export interface SuggestedPlayers {
  numplayers: string;
  best: number;
  not_recomended: number;
  recommended: number;
}

export function ratingColor(game: BoardGame): string {
  const rating = game.ratings?.average ?? 0;
  if (rating >= 8.0) {
    return "#4CAF50";
  }
  if (rating >= 7.0) {
    return "#0288D1";
  }
  return "white";
}

export function weightColor(game: BoardGame): string {
  const rating = game.ratings?.average ?? 0;
  if (rating >= 3.0) {
    return "#F57C00";
  }
  return "#4CAF50";
}



export function recommended(game: BoardGame): string {
  const groups: string[][] = [];

  game.suggested_numplayers?.forEach(p => {
    if (p.best + p.recommended > p.not_recomended) {

      if (p.numplayers?.indexOf('+') > -1) {
        return;
      }

      if (groups.length === 0) {
        groups.push([p.numplayers]);
        return;
      }

      if (parseInt(p.numplayers) - 1 === parseInt(groups[groups.length - 1][groups[groups.length - 1].length - 1])) {
        groups[groups.length - 1].push(p.numplayers);
      } else {
        groups.push([p.numplayers]);
      }
    }

  });

  return groups.map(g => {
    if (g.length === 1) {
      return g[0];
    } else {
      return `${g[0]}-${g[g.length - 1]}`;
    }
  }).join(',');
}

export function best(game: BoardGame): string {
  const groups: string[][] = [];

  game.suggested_numplayers?.forEach(p => {
    if (p.best >= p.recommended && p.best >= p.not_recomended) {

      if (p.numplayers?.indexOf('+') > -1) {
        return;
      }

      if (groups.length === 0) {
        groups.push([p.numplayers]);
        return;
      }

      if (parseInt(p.numplayers) - 1 === parseInt(groups[groups.length - 1][groups[groups.length - 1].length - 1])) {
        groups[groups.length - 1].push(p.numplayers);
      } else {
        groups.push([p.numplayers]);
      }
    }

  });

  return groups.map(g => {
    if (g.length === 1) {
      return g[0];
    } else {
      return `${g[0]}-${g[g.length - 1]}`;
    }
  }).join(',');
}