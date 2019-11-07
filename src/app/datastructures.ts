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
    [index: string]: {
      [index: number]: boolean
    }
  }
}

export function restructureData(
  data: ISensorReportData,
  disabledOptions: {}): ISensorsLastGroupLevelMetrics[] {
  let result: ISensorsLastGroupLevelMetrics[] = []
  let lastParentGroup: ISensorsLastGroupLevelMetrics
  let prettyGroupnameMapper = {}
  data.meta.prettyGroupnames.forEach((group, groupId) => {
    if (group.length > 0) {
      prettyGroupnameMapper[groupId] = Object.assign({}, group)
    }
  })

  for (let groupId = 0; groupId < data.meta.groups.length; groupId++) {
    const group: string[] = []
    for (let levelId = 0; levelId < data.meta.groups[groupId].length; levelId++) {
      const groupLevelValue = data.meta.groups[groupId][levelId]
      if (prettyGroupnameMapper[levelId] !== undefined) {
        group.push(prettyGroupnameMapper[levelId][groupLevelValue])
      } else {
        group.push(groupLevelValue.toString())
      }
    }

    let parentGroup: string[] = group.slice()
    let lowlevelGroupname = parentGroup.pop().toString()
    //let currentParentGroupHash = parentGroup.join(" ⮀ ")
    let currentParentGroupHash = parentGroup.join(" / ")

    if (!lastParentGroup || lastParentGroup.parentGroupname != currentParentGroupHash) {
      lastParentGroup = {
        parentGroupname: currentParentGroupHash,
        analyzerNames: data.meta.metrics,
        sensorNames: data.meta.sensors,
        groupNames: [],
        metricByAnalyzerBySensorByGroup: [],
        disabledOptions: disabledOptions // todo: convert to rxjs stream
      }

      result.push(lastParentGroup)
    }

    lastParentGroup.groupNames.push(lowlevelGroupname)
    lastParentGroup.metricByAnalyzerBySensorByGroup.push(
      data.metrics[groupId]
    )
  }

  return result
}