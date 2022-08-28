import type { Subject } from 'api/api/v1/subjects'
import type { CallbackInterface, RecoilState } from 'recoil'

type MutationOption<T> = {
  rollbackOnError?: boolean
  refetchOnSuccess?: boolean
  optimisticData?: (current: T) => T
  onStart?: (current: T) => void
  onEnd?: (current: T) => void
  onSuccess?: (current: T) => void
  onError?: (current: T) => void
}

export type SubjectsMutationOption = MutationOption<Subject[]>

type MutateArg = {
  getApi: {
    refetch: () => void
  }
  mutation: (...option: any) => Promise<any>
  queryState: RecoilState<Subject[]>
  recoilCallback: CallbackInterface
  option?: MutationOption<Subject[]>
}

export const mutate = (arg: MutateArg) => {
  const {
    getApi,
    mutation,
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

      mutation()
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
