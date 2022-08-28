import type { RawSelectorOptions } from '@/lib/recoil/ports/types'
import type {
  CallbackAtomResult,
  CallbackAtomSelector,
} from '@/lib/recoil/shorthands/callbackAtom'
import type {
  AtomOptions,
  RecoilState,
  Loadable,
  AtomEffect,
  AtomFamilyOptions,
  SerializableParam,
  CallbackInterface,
  UnwrapRecoilValue,
} from 'recoil'

type BaseOptions = {
  keepPrevious?: boolean
}

type BaseMutations<T> = {
  prefetch: (cb: CallbackInterface) => () => Promise<T>
  refetch: (cb: CallbackInterface) => () => void
}

type QueryResult<T> = [
  RecoilState<T>,
  (options?: UseAtomWithQueryOptions) => Loadable<T>
]

type MutationResult<T, Mutations extends MutationsInput> = CallbackAtomResult<
  BaseMutations<T> & Mutations
>

export type MutationsInput<AnyFunc = (...args: ReadonlyArray<any>) => any> =
  Record<string, (cb: CallbackInterface) => AnyFunc>

export type UseAtomWithQueryOptions = BaseOptions

export type UseAtomWithQueryFamilyOptions<P> = BaseOptions & {
  param: P
}

export type AtomWithQueryOptions<T, Mutations extends MutationsInput> = Omit<
  AtomOptions<T>,
  'key'
> & {
  key?: string
  query: (opts: RawSelectorOptions) => Promise<T>
  mutations?: Mutations
}

export type AtomWithQueryResult<T, Mutations extends MutationsInput> = {
  query: QueryResult<T>
  mutation: MutationResult<T, Mutations>
}

export type AtomWithQueryFamilyOptions<
  T,
  P extends SerializableParam,
  Mutations extends MutationsInput
> = Omit<AtomFamilyOptions<T, P>, 'key' | 'effects'> & {
  key?: string
  query: (param: P) => (opts: RawSelectorOptions) => Promise<T>
  effects?: (param: P) => ReadonlyArray<AtomEffect<T>>
  mutations?: (param: P) => Mutations
}

type QueryFamilyResult<T, P> = [
  (param: P) => RecoilState<T>,
  (options: UseAtomWithQueryFamilyOptions<P>) => Loadable<T>
]

type MutationFamilyResult<T, P, Mutations extends MutationsInput> = [
  (param: P) => CallbackAtomSelector<Mutations>,
  (
    param: P
  ) => UnwrapRecoilValue<CallbackAtomSelector<BaseMutations<T> & Mutations>>
]

export type AtomWithQueryFamilyResult<
  T,
  P extends SerializableParam,
  Mutations extends MutationsInput
> = {
  query: QueryFamilyResult<T, P>
  mutation: MutationFamilyResult<T, P, Mutations>
}
