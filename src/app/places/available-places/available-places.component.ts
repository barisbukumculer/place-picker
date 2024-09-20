import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');

  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  // constructor(private httpClient: HttpClient){}

  ngOnInit() {
    this.isFetching.set(true);
    const sub = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')
      .pipe(
        map((resData) => resData.places),
        catchError((err) => {
          console.log(err);
          return throwError(
            () =>
              new Error(
                'Something went wrong fetching the available places. Please try again later.'
              )
          );
        })
      )
      .subscribe({
        next: (places) => {
          // console.log(resData.places);
          this.places.set(places);
        },
        error: (err) => {
          this.error.set(err.message);
        },

        complete: () => {
          this.isFetching.set(false);
        },
      });
    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }
}
