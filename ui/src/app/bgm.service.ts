import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BoardGame } from './boardgame';
import { environment } from 'src/environments/environment';

const BASE_URL = `${environment.apiUrl}`

@Injectable({
  providedIn: 'root'
})
export class BgmService {

  constructor(private http: HttpClient) { }

  getGames(): Observable<OwnedResponse> {
    return this.http.get<OwnedResponse>(`${BASE_URL}/owned`).pipe(catchError(this.handleError));
  }

  getGameDetails(id: string): Observable<DetailsResponse> {
    return this.http.get<DetailsResponse>(`${BASE_URL}/boardgame`, {params: {id}}).pipe(catchError(this.handleError))
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}

export interface OwnedResponse {
  games?: BoardGame[];
  error?: string;
}

export interface DetailsResponse {
  game?: BoardGame;
  error?: string;
}