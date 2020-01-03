import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISensorsLastGroupLevelMetrics, ISensorReportData, restructureData } from './datastructures';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, distinctUntilChanged, distinctUntilKeyChanged, tap, shareReplay } from 'rxjs/operators';

export type SelectedOptions = { [index: string]: number }

//const json_file = "./assets/export_data.json"
const json_file = "./assets/export_data_empa.json"

export interface AnalyticResultState {
  activePage: number,
  pages: number[],
  metrics: string[],
  sensors: string[],
  metricsSelected: SelectedOptions,
  sensorSelected: SelectedOptions,
  limit: number,
  result: ISensorsLastGroupLevelMetrics[]
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsDataFacadeService {
  private cachedData = new Subject<ISensorsLastGroupLevelMetrics[]>()

  private pageSelected = new Subject<number[]>()
  updatePageSelected = (value: number[]) => this.pageSelected.next(value)

  private metricsSelected = new Subject<string[]>()
  updateMetricsSelected = (values: string[]) => this.metricsSelected.next(values)

  private sensorsSelected = new Subject<string[]>()
  updateSensorsSelected = (values: string[]) => this.sensorsSelected.next(values)

  private limit = new Subject<number>()
  updateLimit = (value: number) => this.limit.next(value)

  private metrics = new Subject<string[]>()
  private sensors = new Subject<string[]>()
  private groups = new Subject<ISensorsLastGroupLevelMetrics[]>()
  private countDataSize = new Subject<number>()

  private pages = combineLatest(this.cachedData, this.limit).pipe(
    map(([restructuredGroups, limit]) => 
      Array(Math.ceil(restructuredGroups.length / limit)).fill(1).map((_, i) => (i+1).toString()))
  )

  // it waits till we have values for all observable
  // execution of context is with the LatestValue of each observable
  settings$ = new ReplaySubject<ISettings>()
  
  constructor(private http: HttpClient) {}

  private setupSettings = () => {
    // order is important
    combineLatest(
      this.pages, 
      this.pageSelected,
      
      this.metrics,
      this.metricsSelected,
      
      this.sensors,
      this.sensorsSelected,
      
      this.limit,
      this.groups
      ).pipe(map<any[], ISettings>(
        ([pages, 
          pageSelected, 
          metrics, 
          metricsSelected, 
          sensors, 
          sensorsSelected, 
          limit, 
          groups]) => {
        return {
          pages: pages,
          pageSelected: pageSelected,
  
          metrics: metrics,
          metricsSelected: metricsSelected,
  
          sensors: sensors,
          sensorsSelected: sensorsSelected,
  
          limit: limit,
          groups: groups
        }
      }))
      .subscribe(v => this.settings$.next(v))
  }

  public downloadAndSetup(url: string) {
    this.setupSettings();
    this.http.get(url).subscribe((data: ISensorReportData) => {
      console.log('data downloaded');
      this.countDataSize.next(data.metrics.length);
      // todo
      this.pageSelected.next([2]),
        this.metrics.next(data.meta.metrics);
      this.metricsSelected.next([]);
      this.sensors.next(data.meta.sensors);
      this.sensorsSelected.next([]);
      this.limit.next(5);
      this.cachedData.next(restructureData(data));
    });
    combineLatest(this.cachedData, this.pageSelected, this.limit).subscribe(([data, page, limit]) => {
      const ixStart = page[0] * limit;
      const ixEnd = page[0] * limit + limit;
      this.groups.next(data.slice(ixStart, ixEnd));
    });
  }
}

interface ISettings {
  pages: string[],
  pageSelected: number,

  metrics: string[],
  metricsSelected: SelectedOptions

  sensors: string[],
  sensorsSelected: SelectedOptions

  limit: number;
  groups: ISensorsLastGroupLevelMetrics[];
}
