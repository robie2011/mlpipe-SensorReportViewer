import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISensorsLastGroupLevelMetrics, ISensorReportData } from './datastructures';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SensorReportViewer';
  data = null
  viewData: ISensorsLastGroupLevelMetrics[]

  grouperFunc = (x: number[]) => {
    let copy = x.slice()
    copy.pop()
    return copy
  }

  disabledOptions = {
    'sensors': {},
    'metrics': {},
  } 

  constructor(http: HttpClient){
    http.get('./assets/export_data.json').subscribe((obj: ISensorReportData) => {
      this.data = obj
      console.log(obj)
      this.grouping(obj)
    })
  }

  toggleButton(config: string, id: number, newState: boolean){
    if (this.disabledOptions[config] === undefined){
      this.disabledOptions[config] = {}
    }

    this.disabledOptions[config][id] = newState
  }

  grouping(data: ISensorReportData){
    //for (let index = 0; index < data.meta.groups.length; index++) {
    let result: ISensorsLastGroupLevelMetrics[] = []
    let lastParentGroup: ISensorsLastGroupLevelMetrics
    let prettyGroupnameMapper = {}
    data.meta.prettyGroupnames.forEach((group, groupId) => {
      if (group.length > 0){
        prettyGroupnameMapper[groupId] = Object.assign({}, group)
      }
    })

    for (let groupId = 0; groupId < data.meta.groups.length; groupId++) {
      const group: string[] = []
      for (let levelId = 0; levelId < data.meta.groups[groupId].length; levelId++) {
        const groupLevelValue = data.meta.groups[groupId][levelId]
        if (prettyGroupnameMapper[levelId] !== undefined){
          group.push(prettyGroupnameMapper[levelId][groupLevelValue])
        } else {
          group.push(groupLevelValue.toString())
        }
      }

      let parentGroup: string[] = group.slice()
      let lowlevelGroupname = parentGroup.pop().toString()
      let currentParentGroupHash = parentGroup.join(" ⮀ ")
      
      if (!lastParentGroup || lastParentGroup.parentGroupname != currentParentGroupHash) {
        lastParentGroup = {
          parentGroupname: currentParentGroupHash,
          analyzerNames: data.meta.metrics,
          sensorNames: data.meta.sensors,
          groupNames: [],
          metricByAnalyzerBySensorByGroup: [],
          disabledOptions: this.disabledOptions
        }

        result.push(lastParentGroup)
      }

      lastParentGroup.groupNames.push(lowlevelGroupname)
      lastParentGroup.metricByAnalyzerBySensorByGroup.push(
        data.metrics[groupId]
      )
    }

    this.viewData = result.slice(0, 10)
  }
}
