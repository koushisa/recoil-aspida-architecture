import type { CallbackInterface, RecoilState } from 'recoil'

export type MutateOption<T> = MutationOption<T> & {
  mutationFn: (...option: any) => Promise<any>
}

export type MutationOption<T> = {
  rollbackOnError?: boolean
  refetchOnSuccess?: boolean
  optimisticData?: (current: T) => T
  onStart?: (current: T) => void
  onEnd?: (current: T) => void
  onSuccess?: (current: T) => void
  onError?: (current: T) => void
}

export type MutateArg<T> = {
  refetch: () => void
  mutationFn: (...option: any) => Promise<any>
  queryState: RecoilState<T>
  recoilCallback: CallbackInterface
  option?: MutationOption<T>
}

export const mutate = <T>(arg: MutateArg<T>) => {
  const {
    refetch,
    mutationFn,
    queryState,
    option: {
      rollbackOnError,
      refetchOnSuccess,
      optimisticData: createOptimisticData,
      onStart,
      onSuccess,
      onError,
      onEnd,
    } = {},
    recoilCallback: { snapshot, set },
  } = arg

  const recorded = snapshot.getLoadable(queryState).getValue()
  const optimisticData = createOptimisticData?.(recorded)

  const call = (current: typeof recorded) =>
    new Promise<any>((resolve, reject) => {
      onStart?.(current)

      mutationFn()
        .then((res) => {
          resolve(res)
          onSuccess?.(current)

          if (refetchOnSuccess) {
            refetch()
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
