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
  useRecoilValue,
} from 'recoil'
import type {
  AspidaMethod,
  AspidaEntry,
  GetApiOption,
  UseAspidaMutation,
  UseAspidaQuery,
  AtomWithAspidaResult,
  GetApiObj,
  GetApiReturn,
  MutationOptions,
} from '@/lib/recoil/integrations/aspida/types'
import { nanoid } from '@/lib/nanoid'
import { isUpdater } from '@/lib/recoil/integrations/aspida/utils/isUpdater'
import { usePromise } from '@/lib/recoil/integrations/aspida/utils/usePromise'
import { atomWithQuery } from '@/lib/recoil/integrations/query/atomWithQuery/atomWithQuery'

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

export const atomWithAspida = <E extends AspidaEntry>(
  args: AtomWithAspidaArgs<E>
): AtomWithAspidaResult<E> => {
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
          getPromise(queryState)

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

  const {
    query: [queryState, useBaseQuery],
    mutation: [, useBaseQueryMutation],
  } = atomWithQuery({
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
  })

  type InnerGetApi = Pick<GetApiObj<E>, 'call' | 'reload'>
  const innerGetApi = selector<InnerGetApi>({
    key: `${key}/innerGetApi`,
    get: ({ getCallback }) => {
      return {
        call: getCallback((callback) => async (query) => {
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
        }),

        reload: getCallback((callback) => async (query) => {
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
            callback.set(queryState, res)

            return
          }

          callback.set(optionState, (current) => ({
            ...current,
            query: isUpdater(query) ? query(current.query) : query,
          }))
        }),
      }
    },
  })

  const useAspidaQuery: UseAspidaQuery<E> = (options) => {
    const { keepPrevious = false } = options || {}

    return useBaseQuery({ keepPrevious })
  }

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

  type MutateArg = {
    getApi: {
      refetch: () => void
    }
    method: Exclude<AspidaMethod, '$get'>
    option: MutationOptions<GetApiReturn<E>>
    callback: CallbackInterface
  }

  const mutate = (arg: MutateArg) => {
    const {
      getApi,
      option: {
        rollbackOnError,
        refetchOnSuccess,
        optimisticData: createOptimisticData,
        onStart,
        onSuccess,
        onError,
        onEnd,
      },
      callback: { snapshot, set },
    } = arg

    const recorded = snapshot.getLoadable(queryState).getValue()
    const optimisticData = createOptimisticData?.(recorded)

    const call = (current: typeof recorded) =>
      new Promise<any>((resolve, reject) => {
        onStart?.(current)

        callApi(arg)
          .then((res) => {
            resolve(res)
            onSuccess?.(current)

            if (refetchOnSuccess) {
              getApi.refetch()
            }
          })
          .catch((err) => {
            onError?.(current)
            reject(err)
          })
          .finally(() => {
            onEnd?.(current)
          })
      })

    if (optimisticData === undefined) {
      return call(recorded)
    }

    const optimisticUpdate = () =>
      new Promise<void>((resolve, reject) => {
        set(queryState, optimisticData)

        call(optimisticData)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            reject(err)

            if (!rollbackOnError) {
              return
            }

            set(queryState, recorded)
          })
      })

    return optimisticUpdate()
  }

  const useAspidaMutation: UseAspidaMutation<E> = (mutationOption) => {
    const baseGetApi = {
      ...useBaseQueryMutation(),
      ...useRecoilValue(innerGetApi),
    }

    const getApi = {
      ...baseGetApi,
      ...usePromise(baseGetApi.call, mutationOption),
    }

    const callPost = useRecoilCallback(
      (callback) => (option: any) => {
        return mutate({
          method: '$post',
          getApi,
          option,
          callback,
        })
      },
      []
    )
    const postApi = usePromise(callPost, mutationOption)

    const callPut = useRecoilCallback(
      (callback) => async (option: any) => {
        return mutate({
          method: '$put',
          getApi,
          option,
          callback,
        })
      },
      []
    )
    const putApi = usePromise(callPut, mutationOption)

    const callPatch = useRecoilCallback(
      (callback) => async (option: any) => {
        return mutate({
          method: '$patch',
          getApi,
          option,
          callback,
        })
      },
      []
    )
    const patchApi = usePromise(callPatch, mutationOption)

    const callDelete = useRecoilCallback(
      (callback) => async (option: any) => {
        return mutate({
          method: '$delete',
          getApi,
          option,
          callback,
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
    query: [queryState, useAspidaQuery],
    mutation: [useAspidaMutation],
  }
}
