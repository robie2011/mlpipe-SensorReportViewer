import { Component, OnChanges, Input } from '@angular/core';
import { SensorViewData } from '../data-processor';

@Component({
  selector: 'sensor-graph',
  templateUrl: './sensor-graph.component.html',
  styleUrls: ['./sensor-graph.component.scss']
})
export class SensorGraphComponent implements OnChanges {
  @Input() sensor: SensorViewData

  @Input() metricsEnabled: number[]

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

  private generateViewData() {
    const seriesData = this.sensor.metricNames
    .map((metricName, metricId) => {
      const metricSerie = this.sensor.groupNames.map(
        (groupName, groupId) => this.sensor.metricsByGroup[groupId][metricId])

      return {
        metricId: metricId,
        label: metricName,
        data: metricSerie,
        backgroundColor: () => 'rgba(0, 0, 0, .7)',
        borderColor: () => 'rgba(0, 0, 0, .8)'
      }
    })
    .filter(o => this.metricsEnabled.findIndex(m => m === o.metricId) > -1)

    const singleSensorViewData = seriesData.map(d => {
      return {
        labels: this.sensor.groupNames,
        datasets: [d]
      }
    })


    const groupedSensorViewData = []
    singleSensorViewData.forEach(
      (vdata, ix) => {
        if (ix % 2 === 0) {
          groupedSensorViewData.push([vdata])
        } else {
          groupedSensorViewData[groupedSensorViewData.length - 1].push(vdata)
        }
      }
    )

    this.groupedData = groupedSensorViewData
  }
}
