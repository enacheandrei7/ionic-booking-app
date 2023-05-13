import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiscoverPage } from './discover.page';
import { PlacesPage } from '../places.page';

const routes: Routes = [
  {
    path: '',
    // component: PlacesPage
    component: DiscoverPage
  },
  // {
  //   path: ':placeId',
  //   loadChildren: () => import('./place-detail/place-detail.module').then( m => m.PlaceDetailPageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscoverPageRoutingModule {}
