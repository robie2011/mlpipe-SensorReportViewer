import { Component, Input } from '@angular/core';
import { mapToSelectedOptions } from '../datastructures';
import { SelectedOptions } from "../datastructures";
import { SensorViewData } from '../data-processor';

@Component({
  selector: 'materialized-sensor',
  templateUrl: './materialized-sensor.component.html',
  styleUrls: ['./materialized-sensor.component.scss']
})
export class MaterializedSensorComponent {
  _metricsEnabled: SelectedOptions;

  @Input()
  set metricsEnabled(indexes: number[]){
    this._metricsEnabled = mapToSelectedOptions(indexes)
  }
  
  @Input()
  data: SensorViewData
}
