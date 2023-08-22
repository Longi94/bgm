import { Component, Inject } from '@angular/core';
import { BgmService } from './bgm.service';
import { BoardGame, best, ratingColor, recommended, weightColor } from './boardgame';
import { ViewEncapsulation } from '@angular/core';
import { PlayerCountFilterMode, SortDirection, SortType } from './filter.pipe';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, NgIf } from '@angular/common';

export interface DialogData {
  game: BoardGame;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'ng-bgm';

  loading = true;
  total = 0;
  loaded = 0;

  error?: string;

  games: { [id: string]: BoardGame } = {};

  searchText = '';
  playerCountFilter = '';
  playerCountFilterMode: PlayerCountFilterMode = 'playable';
  sort: SortType = 'alphabetical';
  sortDirection: SortDirection = 'asc';

  constructor(private bgmService: BgmService, public dialog: MatDialog) {
  }

  openDialog(game: BoardGame) {
    this.dialog.open(BoardGameDialog, {
      data: { game },
    });
  }

  toggleSortOrder() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  ratingColor(game: BoardGame): string {
    return ratingColor(game);
  }

  weightColor(game: BoardGame): string {
    return weightColor(game);
  }

  getGames(): BoardGame[] {
    return Object.values(this.games);
  }

  roundRating(rating?: number): number {
    return Math.round(((rating ?? 0) + Number.EPSILON) * 100) / 100;
  }

  recommended(game: BoardGame): string {
    return recommended(game);
  }

  best(game: BoardGame): string {
    return best(game);
  }

  ngOnInit() {
    this.bgmService.getGames().subscribe(
      response => {
        const games = response.games ?? [];
        this.total = games.length;

        if (this.total === 0) {
          this.loading = false;
          this.error = 'Got 0 games. Try refreshing.'
          return;
        }


        Promise.all(games.map(game =>
          this.bgmService.getGameDetails(game.id).toPromise().then(details => {
            this.loaded++;
            this.games[game.id] = { ...game, ...details?.game }
          }, error => {
            if (!this.error) {
              this.error = error;
            }
          })
        )).then(() => {
          this.loading = false;
        }, error => {
          this.error = error;
        });
      }
    )
  }
}

@Component({
  selector: 'boardgame-dialog',
  templateUrl: './boardgame-dialog.html',
  styleUrls: ['./boardgame-dialog.less'],
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule, NgIf, NgFor],
})
export class BoardGameDialog {
  constructor(
    public dialogRef: MatDialogRef<BoardGameDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ratingColor(game: BoardGame): string {
    return ratingColor(game);
  }

  weightColor(game: BoardGame): string {
    return weightColor(game);
  }

  roundRating(rating?: number): number {
    return Math.round(((rating ?? 0) + Number.EPSILON) * 100) / 100;
  }

  recommended(game: BoardGame): string {
    return recommended(game);
  }

  best(game: BoardGame): string {
    return best(game);
  }

  htmlDecode(input: string) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
  }
}