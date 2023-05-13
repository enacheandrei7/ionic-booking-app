import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, delay, map, of, switchMap, take, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// [
//   new Place(
//     'p1',
//     'Manhattan Mansion',
//     'In the heart of New Yor k City',
//     'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/West_side_of_Manhattan_from_Hudson_Commons_%2895103p%29.jpg/1200px-West_side_of_Manhattan_from_Hudson_Commons_%2895103p%29.jpg',
//     149.99,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p2',
//     "L'Amour Toujours",
//     'Romantic place in Paris!',
//     'https://cdn.britannica.com/36/135436-050-ED1D0FCE/skyline-Eiffel-Tower-France-Paris.jpg',
//     189.99,
//     new Date('2020-01-01'),
//     new Date('2020-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p3',
//     'The FOggy Palace',
//     'Not your average city trip!',
//     'https://www.shutterstock.com/image-photo/foggy-castle-260nw-124264360.jpg',
//     99.99,
//     new Date('2021-01-01'),
//     new Date('2021-12-31'),
//     'abc'
//   ),
// ]

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  fetchPlaces() {
    return this.http
      .get<{ [key: string]: PlaceData }>(
        'https://ionic-angular-1b480-default-rtdb.firebaseio.com/offered-places.json'
      )
      .pipe(
        map((resData) => {
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].availableFrom),
                  new Date(resData[key].availableTo),
                  resData[key].userId
                )
              );
            }
          }
          return places;
          // return []
        }),
        tap((places) => {
          this._places.next(places);
        })
      );
  }

  getPlace(id: string) {
    return this.http
      .get<PlaceData>(
        `https://ionic-angular-1b480-default-rtdb.firebaseio.com/offered-places/${id}.json`
      )
      .pipe(
        map((placeData) => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId
          );
        })
      );
    // return <Place>{ ...this._places.find((p) => p.id === id) };
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    let newPlace: Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error('No user found!');
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/West_side_of_Manhattan_from_Hudson_Commons_%2895103p%29.jpg/1200px-West_side_of_Manhattan_from_Hudson_Commons_%2895103p%29.jpg',
          price,
          dateFrom,
          dateTo,
          userId
        );

        return this.http.post<{ name: string }>(
          'https://ionic-angular-1b480-default-rtdb.firebaseio.com/offered-places.json',
          { ...newPlace, id: null }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap((places) => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );

    // when using just "places" we can obly subscribe to it, when using "_places" we can
    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap((places) => {
    //     this._places.next(places.concat(newPlace));
    //   })
    // );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        return this.http.put(
          `https://ionic-angular-1b480-default-rtdb.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
