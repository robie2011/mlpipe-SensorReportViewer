import { Component, OnInit, Input } from '@angular/core';
import { ISensorsLastGroupLevelMetrics } from '../datastructures';
import { SelectedOptions } from "../datastructures";

@Component({
  selector: 'materialized-sensor',
  templateUrl: './materialized-sensor.component.html',
  styleUrls: ['./materialized-sensor.component.scss']
})
export class MaterializedSensorComponent {
  private _data: ISensorsLastGroupLevelMetrics

  @Input()
  sensorId: number;

  @Input()
  metricsEnabled: SelectedOptions = {}
  
  @Input()
  data: ISensorsLastGroupLevelMetrics
}
