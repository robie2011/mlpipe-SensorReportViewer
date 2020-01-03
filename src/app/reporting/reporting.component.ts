import { Component, OnInit } from '@angular/core';
import { AnalyticsDataFacadeService } from '../analytics-data-facade.service';
import { ActivatedRoute } from '@angular/router';

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
  constructor(public analyticsDataFacade: AnalyticsDataFacadeService, private route: ActivatedRoute) { }

  getViewValues(arr){
    if (arr instanceof(Array)) return arr
    return [arr]
  }

  ngOnInit() {
    let name = this.route.snapshot.paramMap.get('name')
    this.analyticsDataFacade.downloadAndSetup(`http://localhost:5000/api/analytics/${name}`)
  }

}
