import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterializedSensorComponent } from './materialized-sensor/materialized-sensor.component';
import { MultiOptionsSelectorComponent } from './options-selector/options-selector.component';
import { AnalysisDescriptionComponent } from './analysis-description/analysis-description.component';
import { ReportingComponent } from './reporting/reporting.component';

@NgModule({
  declarations: [
    AppComponent,
    MaterializedSensorComponent,
    MultiOptionsSelectorComponent,
    AnalysisDescriptionComponent,
    ReportingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }