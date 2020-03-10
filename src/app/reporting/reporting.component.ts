import { Component, OnInit } from '@angular/core';
import { AnalyticsDataFacadeService } from '../analytics-data-facade.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { clone } from '../utils';


@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {

  groupsAndSettings = combineLatest(
    this.analyticsDataFacade.viewData,
    this.analyticsDataFacade.settingsNew
  ).pipe(map(
    ([data, settings]) => [data, settings.metricsSelected]
  ))


  constructor(
    public analyticsDataFacade: AnalyticsDataFacadeService) { }
    private name: string

  getViewValues(arr){
    if (arr instanceof(Array)) return arr
    return [arr]
  }

  ngOnInit() {
    this.groupsAndSettings
    this.analyticsDataFacade.downloadAndSetup(this.name)
  }

  updateFilter(filterId: number, selectionIds: number[]){
    let filters = this.analyticsDataFacade.filterSettings.getValue()
    filters = clone(filters)
    filters.filter(f => f.id === filterId)[0].selected = selectionIds
    this.analyticsDataFacade.filterSettings.next(filters)
  }
}
