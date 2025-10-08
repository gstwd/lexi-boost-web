export interface DictOption {
  label: string
  value: number
}

/**
 * 所有字典 key 的定义
 * 在这里集中声明（可自动提示）
 */
export type DictKey = 'wordEntryLocation'

/**
 * 所有字典数据的类型定义
 */
export type DictsType = Record<DictKey, DictOption[]>

/**
 * 通用工具函数
 */
export function getLabel<T>(dict: DictOption[], value: T): string {
  return dict.find(item => item.value === value)?.label ?? ''
}

export function getDict<K extends DictKey>(dicts: DictsType, key: K): DictsType[K] {
  return dicts[key]
}
