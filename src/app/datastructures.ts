export type IMetricsBySensorByGroup = number[][][]

export interface ISensorReportData {
  meta: {
    groupers: [string],

    // level 0: group id
    // level 1: combined group value
    groups: number[][],
    metrics: string[],
    sensors: string[],
    prettyGroupnames: string[][] // level 0: group id, level 1: mapping
  }
  // level 0: group id
  // level 1: sensor id
  // level 2: metrics id
  metrics: IMetricsBySensorByGroup
}

export interface ISensorsLastGroupLevelMetrics {
  parentGroupname: string,
  sensorNames: string[],
  groupNames: string[],
  analyzerNames: string[],  
  metricByAnalyzerBySensorByGroup: number[][][],
  disabledOptions: {
    [index: string]:{
      [index: number]: boolean
    }
  }
}
