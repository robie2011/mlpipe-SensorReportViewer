import { Component, Input } from '@angular/core';
import { mapToSelectedOptions } from '../models';
import { SelectedOptionsMap } from "../models";
import { SensorViewData } from '../data-processor';

@Component({
  selector: 'materialized-sensor',
  templateUrl: './materialized-sensor.component.html',
  styleUrls: ['./materialized-sensor.component.scss']
})
export class MaterializedSensorComponent {
  _metricsEnabled: SelectedOptionsMap;

  @Input()
  set metricsEnabled(indexes: number[]){
    this._metricsEnabled = mapToSelectedOptions(indexes)
  }
  
  @Input()
  data: SensorViewData
}
