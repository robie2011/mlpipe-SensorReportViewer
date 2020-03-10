import { Component, Input } from '@angular/core';
import { mapToSelectedOptions } from '../models';
import { SelectedOptionsMap } from "../models";
import { SensorViewData } from '../data-processor';

@Component({
  selector: 'materialized-sensor',
  templateUrl: './metrics-table.component.html',
  styleUrls: ['./metrics-table.component.scss']
})
export class MetricsTable {
  _metricsEnabled: SelectedOptionsMap;

  @Input()
  set metricsEnabled(indexes: number[]){
    this._metricsEnabled = mapToSelectedOptions(indexes)
  }
  
  @Input()
  data: SensorViewData
}
