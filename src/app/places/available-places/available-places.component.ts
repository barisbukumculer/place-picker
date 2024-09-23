import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

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
  private placesService = inject(PlacesService);

  // constructor(private httpClient: HttpClient){}

  ngOnInit() {
    this.isFetching.set(true);
    const sub = this.placesService.loadAvailablePlaces().subscribe({
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
  }
  onSelectPlace(selectedPlace: Place) {
    const sub = this.placesService
      .addPlaceToUserPlaces(selectedPlace)
      .subscribe({ next: (resData) => console.log(resData) });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }
}
