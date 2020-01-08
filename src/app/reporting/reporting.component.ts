import { Component, OnInit } from '@angular/core';
import { AnalyticsDataFacadeService } from '../analytics-data-facade.service';
import { ActivatedRoute } from '@angular/router';
import io from "socket.io-client";
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';

const VIEW_UPDATE_DELAY = 500
//const json_file = "./assets/export_data.json"
const json_file = "./assets/export_data_empa.json"


// sample heatmap: https://plot.ly/javascript/heatmaps/


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

  constructor(
    public analyticsDataFacade: AnalyticsDataFacadeService, 
    private route: ActivatedRoute) { }
    private name: string
    needReload: boolean = false

  getViewValues(arr){
    if (arr instanceof(Array)) return arr
    return [arr]
  }

  ngOnInit() {
    this.groupsAndSettings
    this.name = this.route.snapshot.paramMap.get('name')
    this.reload()

    const socket = io('http://localhost:5000/ws')
    socket.on('connect', () => console.log("socket connected"))
    socket.on('message', msg => {
      console.info("message received", msg)
      if (msg['type'] && msg['name'] 
        && msg['type'] === 'analytics_description'
        && msg['name'] === this.name) {
          this.needReload = true
        }
    })
  }

  reload = () => {
    this.analyticsDataFacade.downloadAndSetup(this.name)
    this.needReload = false
  }

}
