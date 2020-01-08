import { Component, OnChanges, Input } from '@angular/core';
import { SensorViewData } from '../data-processor';

@Component({
  selector: 'sensor-graph',
  templateUrl: './sensor-graph.component.html',
  styleUrls: ['./sensor-graph.component.scss']
})
export class SensorGraphComponent implements OnChanges {
  @Input() sensor: SensorViewData
  groupedData: any[];  
  // https://www.chartjs.org/docs/latest/configuration/legend.html
  // https://github.com/emn178/angular2-chartjs
  options = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: true
    }
  }



  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    if (changes.sensor) {
      this.generateViewData()
    }
  }

  private generateViewData(){
    const seriesData = this.sensor.metricNames.map((metricName, metricId) => {
      const metricSerie = this.sensor.groupNames.map(
        (groupName, groupId) => this.sensor.metricsByGroup[groupId][metricId])
      
      return {
        label: metricName,
        data: metricSerie,
      }
    })

    const singleSensorViewData = seriesData.map(d => {
      return {
        labels: this.sensor.groupNames,
      datasets: [d]
      }
    })

    
    const groupedSensorViewData = []
    singleSensorViewData.forEach(
      (vdata, ix) => {
        if (ix%2 === 0) {
          groupedSensorViewData.push([vdata])
        } else {
          groupedSensorViewData[groupedSensorViewData.length-1].push(vdata)
        }
      }
    )

    this.groupedData = groupedSensorViewData
  }
}
