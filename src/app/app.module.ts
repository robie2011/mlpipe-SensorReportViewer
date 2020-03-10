import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MultiOptionsSelectorComponent } from './options-selector/options-selector.component';
import { ReportingComponent } from './reporting/reporting.component';
import { SensorGraphComponent } from './sensor-graph/sensor-graph.component';
import { ChartModule } from "angular2-chartjs";
import { MetricsTable } from './metrics-table/metrics-table.component';


@NgModule({
  declarations: [
    AppComponent,
    MetricsTable,
    MultiOptionsSelectorComponent,
    ReportingComponent,
    SensorGraphComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ChartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }