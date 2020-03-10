import { Component, OnInit } from '@angular/core';
import { SensorDataService } from '../sensor-data.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { clone } from '../utils';


@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent{

  groupsAndSettings = combineLatest(
    this.sensorDataService.viewData,
    this.sensorDataService.settings
  ).pipe(map(
    ([data, settings]) => [data, settings.metricsSelected]
  ))

  constructor(
    public sensorDataService: SensorDataService) { }

  updateFilter(filterId: number, selectionIds: number[]){
    let filters = this.sensorDataService.filterSettings.getValue()
    filters = clone(filters)
    filters.filter(f => f.id === filterId)[0].selected = selectionIds
    this.sensorDataService.filterSettings.next(filters)
  }
}
