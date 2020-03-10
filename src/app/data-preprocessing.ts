import { ISensorReportData, SelectedFilter, DataProcessor } from './data-processor'

export class PartitionerInfo {
    constructor(
        public readonly id: number, // position id
        public readonly name: string, // pretty name
        public readonly partitionNames: string[], // partitionIds mapped to prettyName (if available)
        public readonly partitionIds: number[] // available values in partition: unique and sorted
    ) { }
}

/**
 * 
 * @param data 
 * @returns list of group meta informations (Filter)
 */
function createPartitionerInfos(data: ISensorReportData): PartitionerInfo[] {
    const countPartitioners = data.meta.groupToPartitionerToPartition[0].length
    const filters = new Array(countPartitioners).fill(1)
        .map((_, partitionerId) => {
            // foreach partition ...

            // partitionValuesSorted: contains values of partitions, unique and sorted
            const partitionValuesSorted = data.meta.groupToPartitionerToPartition
                .map(partitioners => partitioners[partitionerId]) // getting all partition values
                .filter((value, ix, arr) => arr.findIndex(i => i === value) === ix) // values are unique
                .sort((a, b) => a - b)

            const optionNames = partitionValuesSorted.map(
                partitionValue => data.meta.prettyGroupnames[partitionerId][partitionValue] || partitionValue.toString())
            return new PartitionerInfo(
                partitionerId,
                data.meta.groupers[partitionerId],
                optionNames,
                partitionValuesSorted)
        })

    return filters
}

export function createCachedData(data: ISensorReportData) {
    return new CachedData(
        data,
        createPartitionerInfos(data)
    )
}

export class CachedData {
    constructor(
        private readonly data: ISensorReportData,
        private readonly _partitioners: PartitionerInfo[]) { }

    getViewData = (
        mainPartitionerId: number,
        sensorId: number,
        filters: SelectedFilter[]) => {
        return DataProcessor.process(
            this.data, mainPartitionerId, sensorId, filters, this.partitioners)
    }

    get metrics() {
        return this.data.meta.metrics
    }

    get sensors() {
        return this.data.meta.sensors
    }

    get groupers() {
        return this.data.meta.groupers
    }

    get groupsToPartitionerToPartition() {
        return this.data.meta.groupToPartitionerToPartition
    }

    get partitioners() {
        return this._partitioners
    }
}
