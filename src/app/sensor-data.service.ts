import { Injectable } from '@angular/core';
import { Subject, combineLatest, ReplaySubject, BehaviorSubject, of } from 'rxjs';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { SensorViewData } from './data-processor';
import { clone } from './utils';
import { CachedData, PartitionerInfo, createCachedData } from './data-preprocessing';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  private cachedData = new ReplaySubject<CachedData>()
  public viewData = new ReplaySubject<SensorViewData>()
  public settings = new BehaviorSubject<Settings>(null)
  public filterSettings = new BehaviorSubject<FilterSelection[]>([])

  constructor() {
    this.downloadAndSetup()
  }


  downloadAndSetup = () => {
    // setup initial settings
    this.cachedData.subscribe(cache => {
      let findMaxPartitions = [... cache.partitioners]
      const largestPartitionerId = findMaxPartitions.sort((a,b) => a.partitionIds.length - b.partitionIds.length).reverse()[0].id

      console.log("sending initial settings")
      this.settings.next({
        sensorNames: cache.sensors,
        sensorSelected: [0],
        metricNames: cache.metrics,
        metricsSelected: cache.metrics.map((_, ix) => ix),
        groupNames: cache.groupers,
        groupSelected: [largestPartitionerId]
      })
    })

    // setup generating view data
    combineLatest(this.cachedData, this.settings, this.filterSettings)
      .pipe(
        // on first execution we have null value for setting
        filter(([, settings]) => settings != null),
        map(
          ([cache, settings, filters]) => {


            let viewData = cache.getViewData(
              settings.groupSelected[0],
              settings.sensorSelected[0],
              filters || []) // partitionerToPartitionIx
            return viewData

          }
        )
      ).subscribe(v => this.viewData.next(v))

      // setup: create new filtersettings if main group has changed
      this.viewData.pipe(distinctUntilChanged( (a, b) => a.mainGroupId == b.mainGroupId)).subscribe(v => {
        let filters = v.filters.filter(f => f.id !== v.mainGroupId)
        .map(f => new FilterSelection(f.id, f.name, f.partitionNames, f.partitionIds))

        this.filterSettings.next(filters)

      })

    this.downloadData().subscribe(data => {
      console.log("loading data")
      this.cachedData.next(data);
    });
  }

  updateSelection = (name: string, value: number[]) => {
    let v = this.settings.getValue()
    if (!v) {
      console.warn("looks like we are trying to update settings without having any settings")
      return
    }
    v = Object.assign({}, v)
    switch (name) {
      case "sensor":
        v.sensorSelected = value
        break;

      case "metrics":
        v.metricsSelected = value
        break;

      case "group":
        v.groupSelected = value
        let filters: FilterSelection[] = clone(this.filterSettings.getValue())
        filters.forEach(f => f.selected = [])
        this.filterSettings.next(filters)
        break;

      default:
        throw `unknown selection update: ${name}`
        break;
    }

    this.settings.next(v)
  }

  private downloadData(){
    let rawData = environment.production ? window['sensor_data'] : JSON.parse(window.localStorage.getItem("data"))
    let data = createCachedData(rawData)
    return of(data)
  }
}

export interface Settings {
  sensorNames: string[]
  sensorSelected: number[]
  metricNames: string[]
  metricsSelected: number[]
  groupNames: string[]
  groupSelected: number[]
}

export class FilterSelection extends PartitionerInfo {
  public selected: number[] = []
}
