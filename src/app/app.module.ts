import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule }      from './app-routing.module';
import { AppComponent }          from './app.component';
import { BasicInfoComponent }    from './screens/basic-info/basic-info.component';
import { DepositDatesComponent } from './screens/deposit-dates/deposit-dates.component';
import { InterestComponent }     from './screens/interest/interest.component';
import { DealListComponent }     from './screens/deal-list/deal-list.component';
import { StepProgressComponent } from './shared/step-progress/step-progress.component';

@NgModule({
  declarations: [
    AppComponent,
    BasicInfoComponent,
    DepositDatesComponent,
    InterestComponent,
    DealListComponent,
    StepProgressComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
