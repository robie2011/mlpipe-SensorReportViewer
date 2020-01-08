import { DataProcessor, SensorViewData, ISensorReportData } from "./data-processor"
/// https://github.com/microsoft/vscode-recipes/tree/master/debugging-jest-tests

/**
datastructure of groupToMetricToSensorToMeasurement
[
    // group 0: 
    [
        [SENSOR0, SENSOR1],  // metric0
        [SENSOR0, SENSOR1],  // metric1
    ],
    // group 1: 
    [
        [SENSOR0, SENSOR1],  // metric0
        [SENSOR0, SENSOR1],  // metric1
    ],
]
 */

describe('data-downloader', () => {
    it('#process: no aggregation function, group: 1 member', () => {
        const data = {
            meta: {
                groupers: ["grouper1"],
                groupToPartitionerToPartition: [[10], [10]],
                prettyGroupnames: [],
                sensors: ["s0", "s1"],
                metrics: ["m0", "m1"],
                metricsAggregationFunc: [""]
            },
            groupToMetricToSensorToMeasurement: [
                [
                    [23, 10],
                    [3, 1],
                ],
                [
                    [234, 12],
                    [5, 2],
                ]
            ]
        }
        data.meta.prettyGroupnames[0] = new Array(30)
        data.meta.prettyGroupnames[0][10] = "zehn"

        const expected: SensorViewData = {
                groupNames: ["zehn"],
                metricNames: ["m0", "m1"],
                sensorName: "s0",
                metricsByGroup: [
                    [NaN, NaN]
                ]
        }
        

        expect(DataProcessor.process(data, 0, 0)).toEqual(expected);
    });


    it('#process: aggregation function, group: 1 member', () => {
        const data = {
            meta: {
                groupers: ["grouper1"],
                groupToPartitionerToPartition: [[10], [10]],
                prettyGroupnames: [],
                sensors: ["s0", "s1"],
                metrics: ["m0", "m1"],
                metricsAggregationFunc: [
                    "(a, b) => a + b",
                    "(a, b) => a + b",
                ]
            },
            groupToMetricToSensorToMeasurement: [
                [
                    [23, 10],
                    [3, 1],
                ],
                [
                    [234, 12],
                    [5, 2],
                ]
            ]
        }
        data.meta.prettyGroupnames[0] = new Array(30)
        data.meta.prettyGroupnames[0][10] = "zehn"

        const expected: SensorViewData = {
                groupNames: ["zehn"],
                metricNames: ["m0", "m1"],
                sensorName: "s0",
                metricsByGroup: [
                    [23+234, 3+5]
                ]
        }
        

        expect(DataProcessor.process(data, 0, 0)).toEqual(expected)
    });

    it('#process: aggregation function, group: 2 member', () => {
        const data = {
            meta: {
                groupers: ["grouper1"],
                groupToPartitionerToPartition: [[10], [10], [20]],
                prettyGroupnames: [],
                sensors: ["s0", "s1"],
                metrics: ["m0", "m1"],
                metricsAggregationFunc: [
                    "(a, b) => a + b",
                    "(a, b) => a + b",
                ]
            },
            groupToMetricToSensorToMeasurement: [
                [
                    [23, 10],
                    [3, 1],
                ],
                [
                    [234, 12],
                    [5, 2],
                ],
                [
                    [3, 2],
                    [1, 4]
                ]
            ]
        }
        data.meta.prettyGroupnames[0] = new Array(30)
        data.meta.prettyGroupnames[0][10] = "zehn"
        data.meta.prettyGroupnames[0][20] = "zwanzig"

        const expected: SensorViewData = {
                groupNames: ["zehn", "zwanzig"],
                metricNames: ["m0", "m1"],
                sensorName: "s0",
                metricsByGroup: [
                    [23+234, 3+5],
                    [3, 1]
                ]
        }
        

        expect(DataProcessor.process(data, 0, 0)).toEqual(expected)
    });


    it('#process: aggregation function, group: 2 member, second sensor', () => {
        const data = {
            meta: {
                groupers: ["grouper1"],
                groupToPartitionerToPartition: [[10], [10], [20]],
                prettyGroupnames: [],
                sensors: ["s0", "s1"],
                metrics: ["m0", "m1"],
                metricsAggregationFunc: [
                    "(a, b) => a + b",
                    "(a, b) => a + b",
                ]
            },
            groupToMetricToSensorToMeasurement: [
                [
                    [23, 10],
                    [3, 1],
                ],
                [
                    [234, 12],
                    [5, 2],
                ],
                [
                    [3, 2],
                    [1, 4]
                ]
            ]
        }
        data.meta.prettyGroupnames[0] = new Array(30)
        data.meta.prettyGroupnames[0][10] = "zehn"
        data.meta.prettyGroupnames[0][20] = "zwanzig"

        const expected: SensorViewData = {
                groupNames: ["zehn", "zwanzig"],
                metricNames: ["m0", "m1"],
                sensorName: "s1",
                metricsByGroup: [
                    [10+12, 1+2],
                    [2, 4]
                ]
        }
        

        expect(DataProcessor.process(data, 0, 1)).toEqual(expected)
    });
});