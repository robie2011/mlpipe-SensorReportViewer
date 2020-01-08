import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ISensorReportData, SensorViewData, DataProcessor } from './data-processor'


export class CachedData {
  constructor(private readonly data: ISensorReportData){}
  getViewData = (mainPartitionerId: number, sensorId: number) => {
    return DataProcessor.process(this.data, mainPartitionerId, sensorId)
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
}


@Injectable({
  providedIn: 'root'
})
export class DataDownloaderService {
  constructor(private http: HttpClient) { }

  get(name: string): Observable<CachedData> {
    let url = `http://localhost:5000/api/analytics/${name}`
    return this.http.get<ISensorReportData>(url).pipe(
      map(d => new CachedData(d))
    )
  }
}
