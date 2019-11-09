import { Component, OnInit, Input } from '@angular/core';
import { ISensorsLastGroupLevelMetrics, mapToSelectedOptions } from '../datastructures';
import { SelectedOptions } from "../datastructures";

@Component({
  selector: 'materialized-sensor',
  templateUrl: './materialized-sensor.component.html',
  styleUrls: ['./materialized-sensor.component.scss']
})
export class MaterializedSensorComponent {
  private _metricsEnabled: SelectedOptions

  @Input()
  sensorId: number;

  @Input()
  set metricsEnabled(indexes: number[]){
    this._metricsEnabled = mapToSelectedOptions(indexes)
  }
  
  @Input()
  data: ISensorsLastGroupLevelMetrics
  
}
