import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { MenuController, SegmentChangeEventDetail } from '@ionic/angular';
import { Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[] = [];
  listedLoadedPlaces: Place[] = [];
  relevantPlaces: Place[] = [];
  isLoading = false;
  private _placesSub!: Subscription;

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this._placesSub = this.placesService.places.subscribe((places) => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onMenuOpen() {
    this.menuCtrl.toggle();
  }

  onFilterUpdate(event: any) {
    this.authService.userId.pipe(take(1)).subscribe((userId) => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(
          (place) => place.userId !== userId
        );
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      }
    });
  }

  ngOnDestroy() {
    if (this._placesSub) {
      this._placesSub.unsubscribe();
    }
  }
}
