import { RecoilValue, RecoilValueReadOnly, selector } from 'recoil'
import { nanoid } from '@/lib/nanoid'

/**
 * マッピングSelectorのショートハンドユーティリティ
 *
 * @param targetAtom マッピング元のatom
 * @param mapper マッピング関数
 * @returns 元のatomからマッピングされたRecoilValue
 */
export const atomWithMapper = <T, Mapper extends (value: T) => any>(
  targetAtom: RecoilValue<T>,
  mapper: Mapper
): RecoilValueReadOnly<ReturnType<Mapper>> => {
  return selector({ key: nanoid(), get: ({ get }) => mapper(get(targetAtom)) })
}
