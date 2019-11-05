import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SensorReportViewer';
  data = null
  disabledOptions = {
    'sensors': {},
    'metrics': {},
    'partitioners': {}
  } 

  constructor(http: HttpClient){
    http.get('/assets/export_data.json').subscribe(obj => {
      this.data = obj
      console.log(obj)
    })
  }

  toggleButton(config: string, name: string, newState: boolean){
    console.log(config, name, newState)
    if (this.disabledOptions[config] === undefined){
      this.disabledOptions[config] = {}
    }

    this.disabledOptions[config][name] = newState
  }
}
