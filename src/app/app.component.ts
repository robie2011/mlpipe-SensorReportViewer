import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SensorReportViewer';
  constructor(http: HttpClient){
    http.get('/assets/export_data.json').subscribe(console.log)
  }
}
