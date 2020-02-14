import { Component, OnInit } from '@angular/core';
import { AnalyticsDataFacadeService } from '../analytics-data-facade.service';
import { combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';

const VIEW_UPDATE_DELAY = 500

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {

  groupsAndSettings = combineLatest(
    this.analyticsDataFacade.sensorData$,
    this.analyticsDataFacade.settings$
  ).pipe(tap(console.log))

  filtersAndFilterSelections$ = combineLatest(
    // getting filters without filter for main group
    this.analyticsDataFacade.sensorData$.pipe(
      map(d => d.filters.filter(f => f.id !== d.mainGroupId))),
    
    // getting filter selections
    this.analyticsDataFacade.dynamicFilterOptions$
  )

  constructor(
    public analyticsDataFacade: AnalyticsDataFacadeService) { }
    private name: string
    needReload: boolean = false

  getViewValues(arr){
    if (arr instanceof(Array)) return arr
    return [arr]
  }

  ngOnInit() {
    this.groupsAndSettings
    this.reload()
  }

  reload = () => {
    this.analyticsDataFacade.downloadAndSetup(this.name)
    this.needReload = false
  }

  updateFilter(filterId: number, selectionIds: number[]){
    this.analyticsDataFacade.filterIdAndSelectionsUpdater.next(
      [filterId, selectionIds])
  }

  
}
