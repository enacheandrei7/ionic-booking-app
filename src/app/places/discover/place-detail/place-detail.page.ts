import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Subscription, switchMap, take } from 'rxjs';
import { BookingService } from 'src/app/bookings/booking.service';
import { AuthService } from 'src/app/auth/auth.service';
import { error } from 'console';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place!: Place;
  isBookable = false;
  isLoading = false;
  private _placeSub!: Subscription;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      let fetchUserId: string;
      this.authService.userId
        .pipe(
          take(1),
          switchMap((userId) => {
            if (!userId) {
              throw new Error('Found no user!');
            }
            fetchUserId = userId;
            return this.placesService.getPlace(paramMap.get('placeId')!);
          })
        )
        .subscribe(
          (place) => {
            this.place = place;
            this.isBookable = place.userId !== fetchUserId;
            this.isLoading = false;
          },
          (error) => {
            this.alertCtrl
              .create({
                header: 'An error occured!',
                message: 'Could not load place.',
                buttons: [
                  {
                    text: 'Okay',
                    handler: () => {
                      this.router.navigate(['/places/tabs/discover/']);
                    },
                  },
                ],
              })
              .then((alerEl) => alerEl.present());
          }
        );
    });
  }

  onBookPlace() {
    // this.router.navigateByUrl('/places/tabs/discover')
    // this.navCtrl.navigateBack('/places/tabs/discover');
    this.actionSheetCtrl
      .create({
        header: 'Choose an Action',
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookingModal('select');
            },
          },
          {
            text: 'Random Date',
            handler: () => {
              this.openBookingModal('random');
            },
          },
          {
            text: 'Cancel',
            role: 'destructive',
          },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, sekectedMode: mode },
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((resultData) => {
        if (resultData.role === 'confirm') {
          this.loadingCtrl
            .create({ message: 'Booking place...' })
            .then((loadingEl) => {
              loadingEl.present();
              const data = resultData.data.bookingData;
              this.bookingService
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.startDate,
                  data.endDate
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                });
            });
        }
      });
  }

  ngOnDestroy() {
    if (this._placeSub) {
      this._placeSub.unsubscribe();
    }
  }
}
