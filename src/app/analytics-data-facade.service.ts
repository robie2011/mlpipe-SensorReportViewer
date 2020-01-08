import { Injectable } from '@angular/core';
import { Subject, combineLatest, ReplaySubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CachedData, DataDownloaderService } from './data-downloader.service';
import { SensorViewData } from './data-processor';
import { getArrayIndexes, flatMap } from "./utils";
import { ISettings } from "./models";



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
  private sensorData = new Subject<SensorViewData>()
  public meta = {
    "sensors": new OptionsSubject(),
    "metrics": new OptionsSubject(),
    "groupNames": new OptionsSubject()
  }

  // it waits till we have values for all observable
  // execution of context is with the LatestValue of each observable
  settings$: Observable<ISettings>
  meta$ = new ReplaySubject<{}>()
  sensorData$: Observable<SensorViewData>
  
  isLoading = false

  constructor(private downloader: DataDownloaderService) {
    this.sensorData$ = this.sensorData.asObservable()

    this.meta$AggregationSetup()
    this.settings$AggregationSetup()
    this.sensorData$AggregationSetup()
  }

  private meta$AggregationSetup = () =>{
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

  private settings$AggregationSetup = () => {
    this.settings$ = this.meta$.pipe(map(
      meta => {
        return {
          metrics: meta['metrics'],
          metricsSelected: meta['metricsSelected'],
  
          sensors: meta['sensors'],
          sensorsSelected: meta['sensorsSelected'],

          groupNames: meta['groupNames'],
          groupNameSelected: meta['groupNamesSelected'],
        }
      }
    ))
  }

  private sensorData$AggregationSetup = () => {
    // we are waiting to get the latest cachedData and parameters to extract viewData
    combineLatest(
      this.cachedData, 
      this.meta["sensors"].selectedIds, 
      this.meta["groupNames"].selectedIds).subscribe(([cachedData, [selectedSensorId], [selectedPartitionerId]]) => {
        console.log(`viewData parameters: sensorId=${selectedSensorId}, partitionerId=${selectedPartitionerId}`)

      this.sensorData.next(cachedData.getViewData(selectedPartitionerId, selectedSensorId));
      this.isLoading = false
    })
  }

  public downloadAndSetup = (name: string) => {
    this.isLoading = true

    this.downloader.get(name).subscribe(data => {

      this.cachedData.next(data);

      // auto seelct new parameters according new data
      this.meta['metrics'].names.next(data.metrics)
      this.meta['metrics'].selectedIds.next(getArrayIndexes(data.metrics))
      
      this.meta['sensors'].names.next(data.sensors)
      this.meta['sensors'].selectedIds.next([0])

      this.meta['groupNames'].names.next(data.groupers)
      this.meta['groupNames'].selectedIds.next([0])

    });
  }
}

