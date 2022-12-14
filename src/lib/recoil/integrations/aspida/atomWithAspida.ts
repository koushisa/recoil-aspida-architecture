/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react-hooks/rules-of-hooks */

import {
  atom,
  selector,
  ReadOnlySelectorOptions,
  RecoilLoadable,
  CallbackInterface,
  useRecoilCallback,
} from 'recoil'
import type {
  AspidaMethod,
  AspidaEntry,
  GetApiOption,
  UseAspidaMutation,
  AtomWithAspidaResult,
  UseAspidaQuery,
  UseAspidaQueryLoadable,
  QueryState,
} from '@/lib/recoil/integrations/aspida/types'

import { nanoid } from '@/lib/nanoid'
import { isUpdater } from '@/lib/recoil/integrations/aspida/utils/isUpdater'
import { usePromise } from '@/lib/recoil/integrations/aspida/utils/usePromise'
import { atomWithQuery } from '@/lib/recoil/integrations/query/atomWithQuery/atomWithQuery'
import { useConstant } from '@/lib/useConstant'

export type AtomWithAspidaArgs<E extends AspidaEntry> = {
  entry: ReadOnlySelectorOptions<E>['get']
  option?: (
    opts: Parameters<ReadOnlySelectorOptions<GetApiOption<E>>['get']>[0],
    currentOption: GetApiOption<E>
  ) => GetApiOption<E>
  disabled?: (
    opts: Parameters<ReadOnlySelectorOptions<boolean>['get']>[0],
    currentOption: GetApiOption<E>
  ) => boolean
  key?: string
}

export function atomWithAspida<E extends AspidaEntry>(
  args: AtomWithAspidaArgs<E>
): AtomWithAspidaResult<E> {
  const { entry, option, disabled, key = nanoid() } = args

  const delegatedEntry = selector({
    key: `${key}/delegatedEntry`,
    get: (opts) => entry(opts),
  })

  const delegatedOption = selector({
    key: `${key}/delegatedOption`,
    get: (opts) => {
      const currentOption = opts.get(optionState)

      return option?.(opts, currentOption)
    },
  })

  const delegatedDisabled = selector({
    key: `${key}/delegatedDisabled`,
    get: (opts) => {
      if (disabled === undefined) {
        return false
      }

      const currentOption = opts.get(optionState)

      return disabled(opts, currentOption)
    },
  })

  let isQueryInitialized = false

  const optionState = atom<GetApiOption<E>>({
    key: `${key}/optionState`,
    default: {} as GetApiOption<E>,

    // set initial value via effects to avoid circular dependency with delegatedOption
    effects: [
      ({ trigger, node, setSelf, getPromise }) => {
        const init = async () => {
          // evaluate in order from the deepest hierarchy
          const self = await getPromise(node)
          const initialValue = await getPromise(delegatedOption)
          getPromise(queryState.data)

          if (isQueryInitialized) {
            return
          }

          setSelf({ ...self, ...initialValue })
        }

        if (trigger === 'get') {
          init()
        }
      },
    ],
  })

  const queryState: QueryState<E> = atomWithQuery({
    key: `${key}/queryState`,
    query: (opts) => {
      const { get } = opts

      const isDisabled = get(delegatedDisabled)

      if (isDisabled) {
        return RecoilLoadable.loading() as unknown as Promise<unknown>
      }

      isQueryInitialized = true

      const api = get(delegatedEntry)
      const option = get(optionState)

      const apiOption = {
        ...option,
        // possible to override from others
        ...get(delegatedOption),
      }

      return api.$get(apiOption)
    },
    // `BaseMutations` from atomWithQuery is not needed in here
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mutations: {
      call: (callback) => async (query) => {
        const option = callback.snapshot.getLoadable(optionState).getValue()
        const newOption = {
          ...option,
          query: isUpdater(query) ? query(option?.query) : query,
        }

        const res = await callApi({
          method: '$get',
          option: newOption,
          callback,
        })

        return res
      },

      reload: (callback) => async (query) => {
        const { waitForSettled } = await callback.snapshot.getPromise(
          queryState.mutation
        )

        if (!isQueryInitialized) {
          const option = callback.snapshot.getLoadable(optionState).getValue()
          const newOption = {
            ...option,
            query: isUpdater(query) ? query(option?.query) : query,
          }

          const res = await callApi({
            method: '$get',
            option: newOption,
            callback,
          })

          isQueryInitialized = true

          callback.set(optionState, newOption)
          callback.set(queryState.data, res)

          return waitForSettled()
        }

        callback.set(optionState, (current) => ({
          ...current,
          query: isUpdater(query) ? query(current.query) : query,
        }))

        return waitForSettled()
      },
    },
  })

  type CallApiArg = {
    method: AspidaMethod
    option: unknown
    callback: CallbackInterface
  }

  const callApi = (arg: CallApiArg) => {
    const {
      method,
      option,
      callback: { snapshot },
    } = arg

    const api = snapshot.getLoadable(delegatedEntry).getValue()[method]

    if (!api) {
      throw new Error(`Method ${method} not found`)
    }

    return api(option)
  }

  const useAspidaQuery: UseAspidaQuery<E> = (options) => {
    const { keepPrevious = false } = options || {}

    return queryState.useQuery({ keepPrevious }) as any
  }

  const useAspidaQueryLoadable: UseAspidaQueryLoadable<E> = (options) => {
    const { keepPrevious = false } = options || {}

    return queryState.useQueryLoadable({ keepPrevious }) as any
  }

  const useAspidaMutation: UseAspidaMutation<E> = (mutationOption) => {
    const baseGetApi = queryState.useMutation()

    const getApi = {
      ...baseGetApi,
      ...usePromise(baseGetApi.call, mutationOption),
    }

    const callPost = useRecoilCallback(
      (callback) => (option: any) => {
        return getApi.mutate({
          ...mutationOption,
          ...option,
          mutationFn: () =>
            callApi({
              method: '$post',
              option,
              callback,
            }),
        })
      },
      []
    )
    const postApi = usePromise(callPost, mutationOption)

    const callPut = useRecoilCallback(
      (callback) => async (option: any) => {
        return getApi.mutate({
          ...mutationOption,
          ...option,
          mutationFn: () =>
            callApi({
              method: '$put',
              option,
              callback,
            }),
        })
      },
      []
    )
    const putApi = usePromise(callPut, mutationOption)

    const callPatch = useRecoilCallback(
      (callback) => async (option: any) => {
        return getApi.mutate({
          ...mutationOption,
          ...option,
          mutationFn: () =>
            callApi({
              method: '$patch',
              option,
              callback,
            }),
        })
      },
      []
    )
    const patchApi = usePromise(callPatch, mutationOption)

    const callDelete = useRecoilCallback(
      (callback) => async (option: any) => {
        return getApi.mutate({
          ...mutationOption,
          ...option,
          mutationFn: () =>
            callApi({
              method: '$delete',
              option,
              callback,
            }),
        })
      },
      []
    )
    const deleteApi = usePromise(callDelete, mutationOption)

    return {
      getApi,
      postApi,
      putApi,
      patchApi,
      deleteApi,
    } as any // FIXME: type cast
  }

  return {
    data: queryState.data,
    useQuery: useAspidaQuery,
    useQueryLoadable: useAspidaQueryLoadable,
    useMutation: useAspidaMutation,
  }
}

export function useAtomWithAspida<E extends AspidaEntry>(
  args: AtomWithAspidaArgs<E> & { key: string }
): AtomWithAspidaResult<E> {
  const { key, ...delegatedProps } = args

  return useConstant(key, () => atomWithAspida(delegatedProps))
}
