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
import { usePrevious } from '@/lib/recoil/integrations/query/atomWithQuery/utils/usePrevious'
import { callbackAtomFamily } from '@/lib/recoil/shorthands/callbackAtom'

/** Atom to rerun options.get by reset() */
export function atomWithQuery<T, Mutations extends MutationsInput>(
  options: AtomWithQueryOptions<T, Mutations>
): AtomWithQueryResult<T, Mutations> {
  const { key = nanoid(), mutations: mutation = {} } = options

  const {
    query: [baseQueryState, useBaseQuery],
    mutation: [baseMutationState, useBaseMutation],
  } = atomWithQueryFamily({
    ...options,
    key,
    effects: () => options.effects || [],
    query: () => (opts) => options.query(opts),
    mutations: () => mutation,
  })

  const useQuery = (options?: UseAtomWithQueryOptions) =>
    useBaseQuery({ ...options, param: key })

  const useMutation = () => useBaseMutation(key)

  return {
    query: [baseQueryState(key), useQuery],
    mutation: [baseMutationState(key), useMutation],
  } as any
}

/** AtomFamily to rerun options.get by reset() */
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

  const [mutationState] = callbackAtomFamily((param: P) => ({
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
  }))

  // use state with Loadable and cache invalidation
  const useQuery = (options: UseAtomWithQueryFamilyOptions<P>) => {
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

  const useMutation = (param: P) => useRecoilValue(mutationState(param))

  return {
    query: [state, useQuery],
    mutation: [mutationState, useMutation],
  } as any
}
