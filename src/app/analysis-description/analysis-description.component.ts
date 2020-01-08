import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-analysis-description',
  templateUrl: './analysis-description.component.html',
  styleUrls: ['./analysis-description.component.scss']
})
export class AnalysisDescriptionComponent implements OnInit {
  descriptions$

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // todo: make dynamic?
    this.descriptions$ = this.http.get('http://localhost:5000/api/analytics_descriptions')
  }


  options = {
    responsive: true,
    maintainAspectRatio: false
  };

  data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "My First dataset",
        data: [65, 59, 80, 81, 56, 55, 40]
      }
    ]
  }

}
