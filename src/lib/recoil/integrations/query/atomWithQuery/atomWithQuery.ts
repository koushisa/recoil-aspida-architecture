/* eslint-disable @typescript-eslint/no-empty-function */
// Referenced from
// https://scrapbox.io/study-react/atomRewind
// https://github.com/facebookexperimental/Recoil/issues/571#issuecomment-693364531

import {
  DefaultValue,
  useRecoilValue,
  useRecoilValueLoadable,
  selectorFamily,
  atomFamily,
  SerializableParam,
  RecoilLoadable,
} from 'recoil'
import type {
  UseAtomWithQueryOptions,
  AtomWithQueryFamilyOptions,
  UseAtomWithQueryFamilyOptions,
  AtomWithQueryOptions,
  AtomWithQueryResult,
  MutationsInput,
  AtomWithQueryFamilyResult,
} from '@/lib/recoil/integrations/query/atomWithQuery/types'
import { nanoid } from '@/lib/nanoid'
import {
  mutate,
  MutateOption,
} from '@/lib/recoil/integrations/query/atomWithQuery/utils/mutate'
import { usePrevious } from '@/lib/recoil/integrations/query/atomWithQuery/utils/usePrevious'
import { callbackAtomFamily } from '@/lib/recoil/shorthands/callbackAtom'

export function atomWithQuery<T, Mutations extends MutationsInput>(
  options: AtomWithQueryOptions<T, Mutations>
): AtomWithQueryResult<T, Mutations> {
  const { key = nanoid(), mutations: mutation = {} } = options

  const queryState = atomWithQueryFamily({
    ...options,
    key,
    effects: () => options.effects || [],
    query: () => (opts) => options.query(opts),
    mutations: () => mutation,
  })

  return {
    data: queryState.data(key),
    mutation: queryState.mutation(key),
    useQuery: (options?: UseAtomWithQueryOptions) =>
      queryState.useQuery({ ...options, param: key }),
    useQueryLoadable: (options?: UseAtomWithQueryOptions) =>
      queryState.useQueryLoadable({ ...options, param: key }),
    useMutation: () => queryState.useMutation(key),
  } as any
}

export function atomWithQueryFamily<
  T,
  P extends SerializableParam,
  Mutations extends MutationsInput
>(
  options: AtomWithQueryFamilyOptions<T, P, Mutations>
): AtomWithQueryFamilyResult<T, P, Mutations> {
  const {
    key = nanoid(),
    dangerouslyAllowMutability,
    effects = () => [],
    mutations: delegatedMutations,
  } = options

  const delegatedQuery = selectorFamily<T, P>({
    key: `${key}/delegatedQuery`,
    dangerouslyAllowMutability,

    get: (param) => (opts) => {
      // In Recoil, Selector data is stored in memory on the process, not in the RecoilRoot.
      // This guard avoided zombie connection when SSR.
      if (typeof window === 'undefined') {
        return RecoilLoadable.loading()
      }

      // for cache invalidation
      opts.get(invalidate(param))

      return options.query(param)(opts)
    },
  })

  const invalidate = atomFamily({
    key: `${key}/invalidate`,
    default: 0,
  })

  const baseAtom = atomFamily<T, P>({
    key,
    dangerouslyAllowMutability,

    default: selectorFamily<T, P>({
      key: `${key}/baseAtom/default`,
      get:
        (param) =>
        ({ get }) =>
          get(delegatedQuery(param)),
    }),

    effects: (param) => {
      const delegatedEffects = effects?.(param) || []
      return [...delegatedEffects]
    },
  })

  const state = selectorFamily<T, P>({
    key: `${key}/state`,
    dangerouslyAllowMutability,

    get:
      (param) =>
      ({ get }) =>
        get(baseAtom(param)),

    set:
      (param) =>
      ({ set, reset }, newValue) => {
        const base = baseAtom(param)

        if (newValue instanceof DefaultValue) {
          set(invalidate(param), (c) => c + 1)

          reset(base)

          return
        }

        set(base, newValue)
      },
  })

  const [mutation] = callbackAtomFamily((param: P) => ({
    ...delegatedMutations?.(param),

    prefetch:
      ({ snapshot }) =>
      () => {
        return snapshot.getPromise(state(param))
      },
    refetch:
      ({ reset }) =>
      () => {
        reset(state(param))
      },
    mutate: (cb) => (option: MutateOption<T>) => {
      const { mutationFn, ...delegatedOption } = option

      return mutate({
        option: delegatedOption,
        queryState: state(param),
        recoilCallback: cb,
        mutationFn,
        refetch: () => cb.reset(state(param)),
      })
    },
  }))

  const useQuery = (
    options: Omit<UseAtomWithQueryFamilyOptions<P>, 'keepPrevious'>
  ) => {
    const { param } = options

    const query = useRecoilValue(state(param))

    return query
  }

  // use state with Loadable and cache invalidation
  const useQueryLoadable = (options: UseAtomWithQueryFamilyOptions<P>) => {
    const { param, keepPrevious = false } = options

    const query = useRecoilValueLoadable(state(param))
    const prevQuery = usePrevious(query)

    const resultLoadable = useMemo(() => {
      // return previous value while loading
      if (
        keepPrevious &&
        prevQuery !== undefined &&
        query.state === 'loading'
      ) {
        return prevQuery
      }

      return query
    }, [keepPrevious, prevQuery, query])

    return resultLoadable
  }

  const useMutation = (param: P) => useRecoilValue(mutation(param))

  return {
    data: state,
    mutation,
    useQuery,
    useQueryLoadable,
    useMutation,
  } as any
}
