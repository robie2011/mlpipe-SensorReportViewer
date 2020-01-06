import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISensorsLastGroupLevelMetrics, ISensorReportData, restructureData } from './datastructures';
import { Subject, combineLatest, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';


export type SelectedOptions = Array<number>

function getArrayIndexes<T>(arr: Array<T>) {
  return arr.map((v, ix) => ix)
}


function flatMap<T,U>(arr: Array<T>, cb: (x: T) => Array<U>): Array<U>{
  let result = []
  arr.map(x => cb(x))
  .forEach(xs => result.push(...xs))
  return result
}

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

class OptionsSubject {
  readonly selectedIds = new Subject<number[]>()
  readonly names = new Subject<string[]>()
  readonly updateSelections = (v: number[]) => this.selectedIds.next(v)
}


@Injectable({
  providedIn: 'root'
})
export class AnalyticsDataFacadeService {
  private cachedData = new Subject<ISensorsLastGroupLevelMetrics[]>()
  public meta = {
    "sensors": new OptionsSubject(),
    "metrics": new OptionsSubject(),
    "groupNames": new OptionsSubject()
  }

  private metricsAggregationFuncs: {(x: number, y: number): number}[] = []

  private pageSelected = new Subject<number[]>()
  updatePageSelected = (v: number[]) => this.pageSelected.next(v)

  private limit = new Subject<number>()
  updateLimit = (v: number) => this.limit.next(v)

  private groups = new Subject<ISensorsLastGroupLevelMetrics[]>()

  private countDataSize = new Subject<number>()

  private pages = combineLatest(this.cachedData, this.limit).pipe(
    map(([restructuredGroups, limit]) => 
      Array(Math.ceil(restructuredGroups.length / limit)).fill(1).map((_, i) => (i+1).toString()))
  )

  // it waits till we have values for all observable
  // execution of context is with the LatestValue of each observable
  settings$ = new ReplaySubject<ISettings>()
  meta$ = new ReplaySubject<{}>()
  
  isLoading = false

  constructor(private http: HttpClient) {
    /**
     * getting two observables from OptionSubject
     * and mapping to flat object with key containing name 
     * resp. key and suffix "Selected" and populating result through $meta subject
     */
    combineLatest(
      flatMap(Object.keys(this.meta), (k: string) => {
        let optionSubject = this.meta[k] as OptionsSubject
        return [optionSubject.names, optionSubject.selectedIds]
      })).pipe(map(xs => {
        let result = {}
        flatMap(Object.keys(this.meta), (key: string) => {
          return [key, `${key}Selected`]
        }).forEach((key: string, ix: number) => result[key] = xs[ix])

        return result
      })).subscribe(xs => this.meta$.next(xs))
  }

  private setupSettings = () => {
    // order is important
    combineLatest(
      this.pages, 
      this.pageSelected,
      
      this.limit,
      this.groups,
      this.meta$
      ).pipe(map<any[], ISettings>(
        ([pages, 
          pageSelected, 
          limit, 
          groups,
          meta]) => {
        return {
          pages: pages,
          pageSelected: pageSelected,
  
          metrics: meta['metrics'],
          metricsSelected: meta['metricsSelected'],
  
          sensors: meta['sensors'],
          sensorsSelected: meta['sensorsSelected'],
  
          limit: limit,
          groups: groups,

          groupNames: meta['groupNames'],
          groupNameSelected: meta['groupNamesSelected']
        }
      }))
      .subscribe(v => this.settings$.next(v))
  }

  public downloadAndSetup(name: string) {
    this.isLoading = true
    let url = `http://localhost:5000/api/analytics/${name}`
    this.setupSettings();
    this.http.get(url).subscribe((data: ISensorReportData) => {
      console.log('data downloaded');
      this.countDataSize.next(data.metrics.length);
      // todo
      this.pageSelected.next([2])
      this.meta['metrics'].names.next(data.meta.metrics)
      this.meta['metrics'].selectedIds.next(getArrayIndexes(data.meta.metrics))
      
      this.meta['sensors'].names.next(data.meta.sensors)
      this.meta['sensors'].selectedIds.next(getArrayIndexes(data.meta.sensors))

      this.meta['groupNames'].names.next(data.meta.groupers)
      this.meta['groupNames'].selectedIds.next([0])

      this.metricsAggregationFuncs = data.meta.metricsAggregationFunc.map(eval)


      this.limit.next(5);
      this.pageSelected.next([0])
      this.cachedData.next(restructureData(data));
    });

    // selecting first group for display
  
    combineLatest(this.cachedData, this.pageSelected, this.limit).subscribe(([data, page, limit]) => {
      const ixStart = page[0] * limit;
      const ixEnd = page[0] * limit + limit;
      this.groups.next(data.slice(ixStart, ixEnd));
      this.isLoading = false
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

  groupNames: string[],
  groupNameSelected: number
}
