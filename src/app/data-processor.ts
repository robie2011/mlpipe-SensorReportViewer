type GroupToMetricToSensorToMeasurement = number[][][]
type AggregatedMetric = { mainPartitionerIds: number[], metricsByGroup: number[][] }
type GroupedMetrics = { [index: string]: number[][] }
type MetricsAggregatorFunc = { (a: number, b: number): number }
type GroupToMetricsToMeasurement = Array<Array<number>>

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
    public readonly metricsByGroup: number[][]) { }
}

export class DataProcessor {

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

    return groupedData
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
    sensorId: number): SensorViewData {

    // grouping data
    const reducedData = DataProcessor.createGroupMetricsMatrix(
      rawData.groupToMetricToSensorToMeasurement, sensorId)
    const mainPartitionIds = rawData.meta.groupToPartitionerToPartition.map(
      partitioner => partitioner[mainPartitionerId])
    let groupedData = DataProcessor.group(reducedData, mainPartitionIds)

    let aggregations = DataProcessor.aggregate(
      groupedData,
      rawData.meta.metricsAggregationFunc.map(eval))

    const groupNames = aggregations.mainPartitionerIds.map(
      (value, ix) => rawData.meta.prettyGroupnames[mainPartitionerId][value] || value.toString())
    return {
      metricNames: rawData.meta.metrics,
      groupNames: groupNames,
      sensorName: rawData.meta.sensors[sensorId],
      metricsByGroup: aggregations.metricsByGroup
    }
  }
}