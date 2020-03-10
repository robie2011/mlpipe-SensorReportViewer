import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { CachedData, createCachedData } from './data-preprocessing';


@Injectable({
  providedIn: 'root'
})
export class DataDownloaderService {
  constructor(private http: HttpClient) { }

  get(name: string): Observable<CachedData> {
    let rawData = environment.production ? window['sensor_data'] : JSON.parse(window.localStorage.getItem("data"))
    let data = createCachedData(rawData)
    return of(data)
  }
}
