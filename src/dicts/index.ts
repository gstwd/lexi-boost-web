import { DictOption, DictsType } from "@/utils/dict";

// 录入单词的位置枚举

const WordEntryLocationDict: DictOption[] = [
    { value: 0, label: '未知' },
    { value: 1, label: '家' },
    { value: 2, label: '公司' },
    { value: 3, label: '旅行' },
    { value: 4, label: '其他' }
]

// 统一创建字典
export const Dicts: DictsType = {
  'wordEntryLocation': WordEntryLocationDict,
}