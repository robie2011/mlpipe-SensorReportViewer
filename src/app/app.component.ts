import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SensorReportViewer';
  data: ISensorReportData = null
  grouperFunc = (x: number[]) => {
    let copy = x.slice()
    copy.pop()
    return copy
  }

  disabledOptions = {
    'sensors': {},
    'metrics': {},
    'partitioners': {}
  } 

  constructor(http: HttpClient){
    http.get('/assets/export_data.json').subscribe((obj: ISensorReportData) => {
      this.data = obj
      console.log(obj)
    })
  }

  toggleButton(config: string, name: string, newState: boolean){
    console.log(config, name, newState)
    if (this.disabledOptions[config] === undefined){
      this.disabledOptions[config] = {}
    }

    this.disabledOptions[config][name] = newState
  }

  grouping(data: ISensorReportData){
    let valuesByGroup: ICustomGroup = {}

    // data.meta.groups.forEach((groupId, index) => {
    //   let key = this.grouperFunc(groupId)
    //   let keyHash = key.join(",")
    //   if (!valuesByGroup[keyHash]){
    //     valuesByGroup[keyHash] = {
    //       key: key,
    //       indexes: [],
    //       data: []
    //     }
    //   }

    //   valuesByGroup[keyHash].indexes.push(index)
    // })
  }

  testData: IMaterializedView = {
    name: "Test Gruppe",
    metricNames: ["Durchschnitt", "Max", "Min"],
    subgroupNames: ["Mo", "Di", "Mi", "Do", "Fr"],
    metricsBySubgroup: [
      [Math.random()*10, Math.random()* 55, Math.random()*100],
      [Math.random()*10, Math.random()* 55, Math.random()*100],
      [Math.random()*10, Math.random()* 55, Math.random()*100],
      [Math.random()*10, Math.random()* 55, Math.random()*100],
      [Math.random()*10, Math.random()* 55, Math.random()*100],
    ]
  }
}

interface ISensorReportData {
  meta: {
    groupers: [string],

    // level 0: group id
    // level 1: combined group value
    groups: number[][],
    metrics: string[],
    sensors: string[]
  }
  // level 0: group id
  // level 1: sensor id
  // level 2: metrics id
  metrics: number[][][]
}

interface ICustomGroup {
  [id: string]: {
    key: number[],
    indexes: number[],
    // level 0: sub-group Id
    // level 1: sensor id
    // level 2: metrics
    data: number[][][]
  }
}

interface IMaterializedView {
  name: string,
  subgroupNames: string[],
  metricNames: string[],
  metricsBySubgroup: number[][]
}