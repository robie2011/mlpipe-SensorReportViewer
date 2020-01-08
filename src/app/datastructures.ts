export type IMetricsBySensorByGroup = number[][][]

export interface ISensorReportDataDeprecated {
  meta: {
    groupers: string[],

    // level 0: group id
    // level 1: combined group value
    groups: number[][],
    metrics: string[],
    sensors: string[],
    prettyGroupnames: string[][], // level 0: group id, level 1: mapping
    metricsAggregationFunc: string[]
  }
  // level 0: group id
  // level 1: sensor id
  // level 2: metrics id
  metrics: IMetricsBySensorByGroup
}

/**
 * export Datastructure from analytics
 * each data point is associated with multiple groups
 */
export interface ISensorsLastGroupLevelMetrics {
  parentGroupname: string,
  sensorNames: string[],
  groupNames: string[],
  analyzerNames: string[],
  metricByAnalyzerBySensorByGroup: number[][][]
}

export function restructureData(data: ISensorReportDataDeprecated): ISensorsLastGroupLevelMetrics[] {
  let result: ISensorsLastGroupLevelMetrics[] = []
  let lastParentGroup: ISensorsLastGroupLevelMetrics

  // data.meta.groups is an array of arrays
  // each array represents value of multiple groups e.g. [2017, 7, 0]
  // we try to map these numberbased group value to pretty name (if possible)
  for (let combinedGroupId = 0; combinedGroupId < data.meta.groups.length; combinedGroupId++) {
    const combinedGroupPretty: string[] = []
    for (let groupLevelId = 0; groupLevelId < data.meta.groups[combinedGroupId].length; groupLevelId++) {
      const groupValue = data.meta.groups[combinedGroupId][groupLevelId]
      const elementPrettyNameOrNull = (data.meta.prettyGroupnames[groupLevelId] || {})[groupValue]
      combinedGroupPretty.push(elementPrettyNameOrNull || groupValue.toString())
    }

    let parentGroup: string[] = combinedGroupPretty.slice()
    let lowlevelGroupname = parentGroup.pop().toString()
    //let currentParentGroupHash = parentGroup.join(" ⮀ ")
    let currentParentGroupHash = parentGroup.join(" / ")

    if (!lastParentGroup || lastParentGroup.parentGroupname != currentParentGroupHash) {
      lastParentGroup = {
        parentGroupname: currentParentGroupHash,
        analyzerNames: data.meta.metrics,
        sensorNames: data.meta.sensors,
        groupNames: [],
        metricByAnalyzerBySensorByGroup: []
      }

      result.push(lastParentGroup)
    }

    lastParentGroup.groupNames.push(lowlevelGroupname)
    lastParentGroup.metricByAnalyzerBySensorByGroup.push(
      data.metrics[combinedGroupId]
    )
  }

  return result
}


export type SelectedOptions = {
  [index: string]: boolean;
};


export function mapToSelectedOptions(arr: number[]): SelectedOptions {
  if (!arr || arr.length == 0) return {}
  let data = {}
  arr.forEach(x => data[x] = true)
  return data
}