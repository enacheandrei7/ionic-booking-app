import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  loadedOffers: Place[] = [];
  isLoading = false;
  private _placesSub!: Subscription;

  constructor(private placesService: PlacesService, private router: Router) {}

  ngOnInit() {
    // Here we get the observable with subscribe(), we don't use take(1) because we want to also see the future changes.
    this._placesSub = this.placesService.places.subscribe((places) => {
      this.loadedOffers = places;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log('Editing item', offerId);
  }

  ngOnDestroy() {
    if (this._placesSub) {
      this._placesSub.unsubscribe();
    }
  }
}
