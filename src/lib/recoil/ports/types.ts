import type {
  GetRecoilValue,
  GetCallback,
  RecoilState,
  RecoilValue,
  TransactionInterface_UNSTABLE,
} from 'recoil'

export type RawSelectorOptions = {
  get: GetRecoilValue
  getCallback: GetCallback
}

export interface TransactionInterface extends TransactionInterface_UNSTABLE {
  get<T>(v: RecoilValue<T>): T
  set<T>(s: RecoilState<T>, updater: ((currVal: T) => T) | T): void
  reset(s: RecoilState<any>): void
}
