type GroupToMetricToSensorToMeasurement = number[][][]
type AggregatedMetric = { mainPartitionerIds: number[], metricsByGroup: number[][] }
type GroupedMetrics = { [index: string]: number[][] }
type MetricsAggregatorFunc = { (a: number, b: number): number }
type GroupToMetricsToMeasurement = Array<Array<number>>
type NestedNumberLookup = { [i: number]: { [j: number]: boolean } }

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
    public readonly filters: Filter[],
    public readonly mainGroupId: number,
    public readonly metricsWithoutAggregators: string[]) { }
}


export class Filter {
  constructor(
  public readonly id: number,
  public readonly name: string,
  public readonly optionNames: string[],
  public readonly optionIds: number[]
  ){}
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

  static process(
    rawData: ISensorReportData,
    mainPartitionerId: number,
    sensorId: number,
    selectedPartitionerToPartitionIx: number[][]): SensorViewData {

    const filters = DataProcessor.createFilters(rawData)

    // lookup: partitioner -> partition value is True or list for partitioner is null
    const partitionValueByPartitioner = DataProcessor.createValidPartitionerValues(
      selectedPartitionerToPartitionIx, filters)
    
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
      filters: filters,
      mainGroupId: mainPartitionerId,
      metricsWithoutAggregators: metricsWithoutAggregators
    }
  }

  private static filterPartitions(
    rawData: ISensorReportData, 
    partitionValueByPartitioner: NestedNumberLookup) {

    const validIndexes = {}

    const filteredSensorData = rawData.groupToMetricToSensorToMeasurement.filter((v, ix) => {
      const isValid = Object.keys(partitionValueByPartitioner).every((partitionerName, partitionerId) => {
        const partitioner = partitionValueByPartitioner[partitionerName]
        if (!partitioner) {
          return true
        }
        else {
          const currentGroupPartitionerValue = rawData.meta.groupToPartitionerToPartition[ix][partitionerId]
          return partitioner[currentGroupPartitionerValue] === true
        }
      })

      if (isValid) validIndexes[ix] = true
      return isValid
    })

    const filteredGroupData = rawData.meta.groupToPartitionerToPartition.filter(
      (v, ix) => validIndexes[ix] === true)

    return {
      filteredGroupData,
      filteredSensorData
    }
  }

  private static createValidPartitionerValues(
    selectedPartitionerToPartitionIx: number[][], 
    filters: Filter[]) : NestedNumberLookup {

    const lookupPartitionerValues = {}
    selectedPartitionerToPartitionIx.map((partitionIxs, partitionerId) => {
      let partitionValueByIx: {
        [index: number]: number
      } = {}
      filters[partitionerId].optionIds.forEach((value, ix) => partitionValueByIx[ix] = value)
      return partitionIxs.map(ix => partitionValueByIx[ix])
    }).forEach((values, partitionerId) => {
      if (values.length === 0) {
        lookupPartitionerValues[partitionerId] = null
      }
      else {
        if (!lookupPartitionerValues[partitionerId])
          lookupPartitionerValues[partitionerId] = {}
        values.forEach(v => lookupPartitionerValues[partitionerId][v] = true)
      }
    })

    return lookupPartitionerValues
  }

  private static createFilters(data: ISensorReportData){
    console.log("generating filter options")
    const countPartitioners = data.meta.groupToPartitionerToPartition[0].length
    const filters = new Array(countPartitioners).fill(1)
      .map((_, partitionerId) => {
        // foreach partition ...
        const partitionValuesSorted = data.meta.groupToPartitionerToPartition
          .map(partitioners => partitioners[partitionerId]) // getting all partition values
          .filter((value, ix, arr) => arr.findIndex(i => i === value) === ix) // values are unique
          .sort((a,b) => a-b)
        
        const optionNames = partitionValuesSorted.map(
          partitionValue => data.meta.prettyGroupnames[partitionerId][partitionValue] || partitionValue.toString())
        return new Filter(
          partitionerId, 
          data.meta.groupers[partitionerId],
          optionNames,
          partitionValuesSorted)
      })

      return filters
  }
}