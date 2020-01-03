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

}
