export type IMetricsBySensorByGroup = number[][][]

export type SelectedOptionsMap = {
  [index: string]: boolean;
};

export function mapToSelectedOptions(arr: number[]): SelectedOptionsMap {
  if (!arr || arr.length == 0) return {}
  let data = {}
  arr.forEach(x => data[x] = true)
  return data
}