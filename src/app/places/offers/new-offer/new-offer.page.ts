import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PlacesService } from '../../places.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  formReactive!: FormGroup;

  constructor(
    private placeService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.formReactive = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)],
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)],
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
    });
  }

  onCreateOffer() {
    if (!this.formReactive.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Creating place...',
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.placeService
          .addPlace(
            this.formReactive.value.title,
            this.formReactive.value.description,
            +this.formReactive.value.price,
            new Date(this.formReactive.value.dateFrom),
            new Date(this.formReactive.value.dateTo)
          )
          .subscribe(() => {
            loadingEl.dismiss()
            this.formReactive.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
      });
    // console.log(
    //   this.formReactive.value.title,
    //   this.formReactive.value.description,
    //   +this.formReactive.value.price,
    //   new Date(this.formReactive.value.dateFrom),
    //   new Date(this.formReactive.value.dateTo)
    // );
  }
}
