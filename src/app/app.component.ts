import { Component, OnInit } from '@angular/core';
import { SelectedOptions } from "./datastructures";
import { AnalyticsDataFacadeService } from './analytics-data-facade.service';
import { map, tap } from 'rxjs/operators';


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
  constructor(public analyticsDataFacade: AnalyticsDataFacadeService) { }

  getViewValues(arr){
    if (arr instanceof(Array)) return arr
    return [arr]
  }

  ngOnInit(){
  }
}
