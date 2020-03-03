import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { ISensorReportData, DataProcessor, Filter } from './data-processor'
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

export class CachedData {
  constructor(
    private readonly data: ISensorReportData){}

  getViewData = (
    mainPartitionerId: number, 
    sensorId: number, 
    selectedPartitionerToPartitionIx: number[][]) => {
    return DataProcessor.process(
      this.data, mainPartitionerId, sensorId, selectedPartitionerToPartitionIx)
  }

  get metrics() {
    return this.data.meta.metrics
  }

  get sensors() {
    return this.data.meta.sensors
  }

  get groupers() {
    return this.data.meta.groupers
  }

  get groupsToPartitionerToPartition(){
    return this.data.meta.groupToPartitionerToPartition
  }
}


@Injectable({
  providedIn: 'root'
})
export class DataDownloaderService {
  constructor(private http: HttpClient) { }

  get(name: string): Observable<CachedData> {
    let rawData = environment.production ? window['sensor_data'] : JSON.parse(window.localStorage.getItem("data"))
    let data = new CachedData(rawData)
    return of(data)
  }
}
