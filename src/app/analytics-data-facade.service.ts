import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISensorsLastGroupLevelMetrics, ISensorReportDataDeprecated, restructureData } from './datastructures';
import { Subject, combineLatest, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CachedData, DataDownloaderService } from './data-downloader.service';
import { SensorViewData } from './data-processor';


export type SelectedOptions = Array<number>

function getArrayIndexes<T>(arr: Array<T>) {
  return arr.map((v, ix) => ix)
}


export function flatMap<T,U>(arr: Array<T>, cb: (x: T) => Array<U>): Array<U>{
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
  private cachedData = new Subject<CachedData>()
  private groups = new Subject<SensorViewData>()
  public meta = {
    "sensors": new OptionsSubject(),
    "metrics": new OptionsSubject(),
    "groupNames": new OptionsSubject()
  }

  // it waits till we have values for all observable
  // execution of context is with the LatestValue of each observable
  settings$ = new ReplaySubject<ISettings>()
  meta$ = new ReplaySubject<{}>()
  groups$ = new ReplaySubject<SensorViewData>()
  
  isLoading = false

  constructor(private downloader: DataDownloaderService) {
    /**
     * getting two observables from OptionSubject
     * and mapping to flat object with key containing name 
     * resp. key and suffix "Selected" and populating result through $meta subject
     */
    console.log("meta$ subject will wait for: ")
    Object.keys(this.meta).forEach(name => {
      console.log("\t", name, `${name}Selected`)
    })

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
    this.groups.subscribe(d => this.groups$.next(d))

    combineLatest(
      this.meta$
      ).pipe(map<any[], ISettings>(
        ([meta]) => {
        return {
          metrics: meta['metrics'],
          metricsSelected: meta['metricsSelected'],
  
          sensors: meta['sensors'],
          sensorsSelected: meta['sensorsSelected'],

          groupNames: meta['groupNames'],
          groupNameSelected: meta['groupNamesSelected'],
        }
      }))
      .subscribe(v => this.settings$.next(v))
  }

  public downloadAndSetup = (name: string) => {
    this.isLoading = true
    
    
    this.setupSettings();
    
    this.downloader.get(name).subscribe(data => {
      console.log('data downloaded');

      // todo
      this.meta['metrics'].names.next(data.metrics)
      this.meta['metrics'].selectedIds.next(getArrayIndexes(data.metrics))
      
      this.meta['sensors'].names.next(data.sensors)
      this.meta['sensors'].selectedIds.next([0])

      this.meta['groupNames'].names.next(data.groupers)
      this.meta['groupNames'].selectedIds.next([0])

      this.cachedData.next(data);
    });

    // selecting first group for display
  
    combineLatest(
      this.cachedData, 
      this.meta["sensors"].selectedIds, 
      this.meta["groupNames"].selectedIds).subscribe(([cachedData, [selectedSensorId], [selectedPartitionerId]]) => {
        console.log(`viewData parameters: sensorId=${selectedSensorId}, partitionerId=${selectedPartitionerId}`)

      this.groups.next(cachedData.getViewData(selectedPartitionerId, selectedSensorId));
      this.isLoading = false
    });
  }
}

interface ISettings {
  metrics: string[],
  metricsSelected: SelectedOptions

  sensors: string[],
  sensorsSelected: SelectedOptions

  groupNames: string[],
  groupNameSelected: number
}
