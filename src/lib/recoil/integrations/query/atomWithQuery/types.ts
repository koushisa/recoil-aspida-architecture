import type { MutateOption } from '@/lib/recoil/integrations/query/atomWithQuery/utils/mutate'
import type { RawSelectorOptions } from '@/lib/recoil/ports/types'
import type { CallbackAtomSelector } from '@/lib/recoil/shorthands/callbackAtom'
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
  waitForSettled: (cb: CallbackInterface) => () => Promise<T>
  refetch: (cb: CallbackInterface) => () => Promise<T>
  mutate: (cb: CallbackInterface) => (option: MutateOption<T>) => Promise<T>
}

type QueryResult<T> = {
  data: RecoilState<T>
  useQuery: (options?: UseAtomWithQueryOptions) => T
  useQueryLoadable: (options?: UseAtomWithQueryOptions) => Loadable<T>
}

type MutationResult<T, Mutations extends MutationsInput> = {
  mutation: CallbackAtomSelector<BaseMutations<T> & Mutations>
  useMutation: () => UnwrapRecoilValue<
    CallbackAtomSelector<BaseMutations<T> & Mutations>
  >
}

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

export type AtomWithQueryResult<
  T,
  Mutations extends MutationsInput
> = QueryResult<T> & MutationResult<T, Mutations>

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

type QueryFamilyResult<T, P> = {
  data: (param: P) => RecoilState<T>
  useQuery: (options: UseAtomWithQueryFamilyOptions<P>) => T
  useQueryLoadable: (options: UseAtomWithQueryFamilyOptions<P>) => Loadable<T>
}

type MutationFamilyResult<T, P, Mutations extends MutationsInput> = {
  mutation: (param: P) => CallbackAtomSelector<Mutations>
  useMutation: (
    param: P
  ) => UnwrapRecoilValue<CallbackAtomSelector<BaseMutations<T> & Mutations>>
}

export type AtomWithQueryFamilyResult<
  T,
  P extends SerializableParam,
  Mutations extends MutationsInput
> = QueryFamilyResult<T, P> & MutationFamilyResult<T, P, Mutations>
