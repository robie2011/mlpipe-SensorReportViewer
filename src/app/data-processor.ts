import { PartitionerInfo } from './data-preprocessing'

type GroupToMetricToSensorToMeasurement = number[][][]
type AggregatedMetric = { mainPartitionerIds: number[], metricsByGroup: number[][] }
type GroupedMetrics = { [index: string]: number[][] }
type MetricsAggregatorFunc = { (a: number, b: number): number }
type GroupToMetricsToMeasurement = Array<Array<number>>
type NestedNumberLookup = { [i: number]: { [j: number]: boolean } }
export type NumberToNumberList = {[i: number]: number[] }

export interface SelectedFilter {
  id: number,
  selected: number[]
}

export interface ISensorReportData {
  meta: {
    groupers: string[],

    // level 0: group id
    // level 1: combined group value
    groupToPartitionerToPartition: number[][],
    metrics: string[],
    sensors: string[],
    prettyGroupnames: string[][], // level 0: group id, level 1: mapping
    metricsAggregationFunc: string[]
  }

  // shape is (groups, analyzers/metrics, sensors)
  groupToMetricToSensorToMeasurement: GroupToMetricToSensorToMeasurement
}


export class SensorViewData {
  constructor(
    public readonly sensorName: string,
    public readonly groupNames: string[],
    public readonly metricNames: string[],
    public readonly metricsByGroup: number[][],
    public readonly filters: PartitionerInfo[],
    public readonly mainGroupId: number,
    public readonly metricsWithoutAggregators: string[],
    public readonly usedFilters: SelectedFilter[]) { }
}




class PartitionFilteringInfo {
  constructor(private readonly partitionerToPartitionMask: NestedNumberLookup){
  }

  canShow = (partitionerId: number, partitionId: number) => {
    const isPartitionerFilterSet = partitionerId in this.partitionerToPartitionMask
    if (!isPartitionerFilterSet){
      return true
    } else {
        return this.partitionerToPartitionMask[partitionerId][partitionId] === true
    }
  }
}


export class DataProcessor {

  /**
   * key contains group value (e.g. "1" for January if for grouping month is choosen)
   */
  private static group(
    dataset: GroupToMetricsToMeasurement,
    partitions: number[]): GroupedMetrics {

    let groupedData: GroupedMetrics = {}
    dataset.forEach((metrics, rowId) => {
      const partitionId = partitions[rowId]

      const key = partitionId
      if (!groupedData[key]) groupedData[key] = []
      groupedData[key].push(metrics)
    })

    // sorting 
    const orderedGroupData = {}
    Object.keys(groupedData)
      .sort()
      .forEach(k => orderedGroupData[k] = groupedData[k])

    return orderedGroupData
  }

  private static createGroupMetricsMatrix(
    data: GroupToMetricToSensorToMeasurement,
    selectSensorId: number): GroupToMetricsToMeasurement {

    return data.map(metrics => metrics.map(
      sensors => sensors[selectSensorId])
    )
  }

  private static aggregate(
    groups: GroupedMetrics,
    aggregationFunctionsByMetricId: MetricsAggregatorFunc[]): AggregatedMetric {
    let subResult: number[][] = []

    // Note: Object.keys(groups) represents the order of group elements.
    // Ordering is important for displaying "pretty names" for group element vaulue later
    Object.keys(groups).forEach(mainPartitionIdStr => {
      const group = groups[mainPartitionIdStr]

      let reducedValues = group[0]
      const hasMultipleMeasurements = group.length > 1
      if (hasMultipleMeasurements) {
        const metricsSize = group[0].length
        reducedValues = []
        for (let metricId = 0; metricId < metricsSize; metricId++) {
          const metricsAggregatorOrNull = aggregationFunctionsByMetricId[metricId]
          const metricMeasurements = group.map(metrics => metrics[metricId])
          const value = metricsAggregatorOrNull ?
            metricMeasurements.reduce(metricsAggregatorOrNull) :
            NaN
          reducedValues.push(value)
          if (!metricsAggregatorOrNull){
            console.log("no aggregator for ", metricId, value)
          }
        }
      }

      subResult.push(reducedValues)
    })

    const result: AggregatedMetric = {
      mainPartitionerIds: Object.keys(groups).map(Number),
      metricsByGroup: subResult
    }

    return result
  }

  /**
   * selectedPartitionerToPartitionIx is used to filter partitions
   * it should satisfy the following equation:
   *    selectedPartitionerToPartitionIx[partitionerId] = [partitionId, ...]
   */
  static process(
    rawData: ISensorReportData,
    mainPartitionerId: number,
    sensorId: number,
    filters: SelectedFilter[],
    partitioners: PartitionerInfo[]): SensorViewData {

    const partitionValueByPartitioner = DataProcessor.createFilteringInfo(filters)
    
      // note: sensordata and group data was filtered! Do not use old unfiltered data.
    const filteredResult = DataProcessor.filterPartitions(rawData, partitionValueByPartitioner)

    // grouping data
    const reducedData = DataProcessor.createGroupMetricsMatrix(
      filteredResult.filteredSensorData, sensorId)
    const mainPartitionIds = filteredResult.filteredGroupData.map(
      partitioner => partitioner[mainPartitionerId])
    let groupedData = DataProcessor.group(reducedData, mainPartitionIds)

    let aggregations = DataProcessor.aggregate(
      groupedData,
      rawData.meta.metricsAggregationFunc.map(eval))

    const groupNames = aggregations.mainPartitionerIds.map(
      (value, ix) => rawData.meta.prettyGroupnames[mainPartitionerId][value] || value.toString())

    const metricsWithoutAggregators = rawData.meta.metricsAggregationFunc.map((v, ix) => {
      if (v.length > 0) return null
      return rawData.meta.metrics[ix]
    }).filter(x => x !== null)

    return {
      metricNames: rawData.meta.metrics,
      groupNames: groupNames,
      sensorName: rawData.meta.sensors[sensorId],
      metricsByGroup: aggregations.metricsByGroup,
      filters: partitioners,
      mainGroupId: mainPartitionerId,
      metricsWithoutAggregators: metricsWithoutAggregators,
      usedFilters: filters
    }
  }

  private static filterPartitions(
    rawData: ISensorReportData, 
    filteringInfo: PartitionFilteringInfo) {

    // we iterate over partition values of each entry (each entry has multiple partitionId)
    // if all partition values of an entry is allowed to show,
    // than we save this index to use it as a filter later.
    const validIndexes = {}
    rawData.meta.groupToPartitionerToPartition.forEach((partitionIds, ix) => {
      if (partitionIds.every(
        (partitionId, partitionerId) => filteringInfo.canShow(partitionerId, partitionId))) {
          validIndexes[ix] = true
      }
    })

    const filteredGroupData = rawData.meta.groupToPartitionerToPartition
    .filter((_, ix) => validIndexes[ix] === true)

    const filteredSensorData = rawData.groupToMetricToSensorToMeasurement
    .filter((_, ix) => validIndexes[ix] === true)

    return {
      filteredGroupData,
      filteredSensorData
    }
  }

  private static createFilteringInfo(
    filters: SelectedFilter[]) : PartitionFilteringInfo {

    const partitionerToPartitionMask = {}
    filters.map(f => {
      if (f.selected && f.selected.length > 0) {
        partitionerToPartitionMask[f.id] = {}

        f.selected.forEach(
          partitionId => partitionerToPartitionMask[f.id][partitionId] = true)
      }
    })

    return new PartitionFilteringInfo(partitionerToPartitionMask)
  }
}