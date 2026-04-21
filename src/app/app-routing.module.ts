import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BasicInfoComponent }    from './screens/basic-info/basic-info.component';
import { DepositDatesComponent } from './screens/deposit-dates/deposit-dates.component';
import { InterestComponent }     from './screens/interest/interest.component';
import { DealListComponent }     from './screens/deal-list/deal-list.component';

const routes: Routes = [
  { path: '',                  redirectTo: 'deal/basic-info', pathMatch: 'full' },
  { path: 'deal/basic-info',   component: BasicInfoComponent },
  { path: 'deal/deposit-dates',component: DepositDatesComponent },
  { path: 'deal/interest',     component: InterestComponent },
  { path: 'deals',             component: DealListComponent },
  { path: '**',                redirectTo: 'deal/basic-info' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
