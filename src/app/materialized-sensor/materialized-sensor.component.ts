import { Component, OnInit, Input } from '@angular/core';
import { ISensorsLastGroupLevelMetrics } from '../datastructures';

@Component({
  selector: 'materialized-sensor',
  templateUrl: './materialized-sensor.component.html',
  styleUrls: ['./materialized-sensor.component.scss']
})
export class MaterializedSensorComponent implements OnInit {
  private _data: ISensorsLastGroupLevelMetrics
  private _sensorId: number;

  ngOnInit() {
  }

  @Input()
  set data(data: ISensorsLastGroupLevelMetrics){
    this._data = data
  }

  get data(){
    return this._data
  }

  @Input()
  set sensorId(sensorId: number){
    this._sensorId = sensorId
  }

  get sensorId(){
    return this._sensorId
  }
}
