import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISensorsLastGroupLevelMetrics, ISensorReportData, restructureData } from './datastructures';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from "rxjs/operators";
import { SelectedOptions, MultiOptions } from './multi-options-selector/multi-options-selector.component';

const VIEW_UPDATE_DELAY = 500
//const json_file = "./assets/export_data.json"
const json_file = "./assets/export_data_empa.json"

// sample heatmap: https://plot.ly/javascript/heatmaps/


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  settingsObs: Subject<ISettingsData> = new Subject<ISettingsData>()
  data
  maxGroupInitValue = 5

  viewObs: Subject<ISensorsLastGroupLevelMetrics[]> = new Subject<ISensorsLastGroupLevelMetrics[]>()
  private _cachedData: ISensorsLastGroupLevelMetrics[]
  private _cachedSettings
  
  private multiOptionsSensors: MultiOptions
  private sensorsEnabled: SelectedOptions = {}

  private multiOptionsMetrics: MultiOptions
  private metricsEnabled: SelectedOptions = {}

  constructor(private http: HttpClient) {}

  sensorsSelected(s: SelectedOptions) {
    this.sensorsEnabled = s

  }

  metricsSelected(s: SelectedOptions) {
    this.metricsEnabled = s
  }

  ngOnInit(): void {
    this.http.get(json_file).subscribe((obj: ISensorReportData) => {
      console.log('data downloded and restructured')
      console.log(obj)
      this.data = obj
      
      // init data for MultiOptionsComponent
      this.multiOptionsSensors = Object.assign({}, obj.meta.sensors)
      this.multiOptionsMetrics = Object.assign({}, obj.meta.metrics)

      this._cachedData = restructureData(obj)

      console.log('send next settings')
      this.settingsObs.next({
        countGroups: this._cachedData.length,
        limit: this.maxGroupInitValue,
        pageActive: 0,
        pages: Array(Math.ceil(this._cachedData.length / this.maxGroupInitValue)).fill(1).map((v, i) => i)
      })
    })

    this.settingsObs.pipe(debounceTime(VIEW_UPDATE_DELAY)).subscribe(settings => {
      console.log("updating data w/", settings)
      this._cachedSettings = settings
      this.viewObs.next(
        this.getFilteredData(settings.limit, settings.pageActive)
      )
    })

    this.viewObs.subscribe(() =>
      console.log("updating new data")
    )
  }

  updateSettings(name: string, value) {
    let lastSetting = Object.assign({}, this._cachedSettings)
    switch (name) {
      case "page":
        lastSetting.pageActive = value
        break;
      case "pageLimit":
        lastSetting.limit = value
        lastSetting.pageActive = 0
        lastSetting.pages = Array(Math.ceil(this._cachedData.length / value)-1).fill(1).map((v, i) => i)
        break;

      default:
        throw 'not found: ' + name
    }
    this.settingsObs.next(lastSetting)
  }

  private getFilteredData(limit: number, activePage: number): ISensorsLastGroupLevelMetrics[] {
    let indexStart = limit * activePage
    let indexEnd = Math.min(indexStart + limit, this._cachedData.length)
    console.log(indexStart, indexEnd, this._cachedData.length)
    return this._cachedData.slice(indexStart, indexEnd)
  }
}

interface ISettingsData {
  countGroups: number,
  limit: number,
  pages: number[],
  pageActive: number
}