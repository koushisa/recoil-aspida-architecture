import type { SetterOrUpdater } from '@/lib/recoil/integrations/aspida/utils/isUpdater'
import type { SpreadTwo } from '@/lib/recoil/integrations/aspida/utils/SpreadTwo'
import type { UseAtomWithQueryOptions } from '@/lib/recoil/integrations/query/atomWithQuery/types'

import type { Loadable, RecoilState } from 'recoil'

export type AnyPromiseFunc = (...option: any) => Promise<any>

export type AspidaEntry = {
  $get: AnyPromiseFunc
  $post?: AnyPromiseFunc
  $put?: AnyPromiseFunc
  $delete?: AnyPromiseFunc
  $patch?: AnyPromiseFunc
}

export type AspidaMethod = keyof AspidaEntry

export type UseAspidaQueryOptions = UseAtomWithQueryOptions

export type UseAspidaMutationOptions = {
  onStart?: () => void
  onSuccess?: () => void
  onError?: (err: unknown) => void
  onEnd?: () => void
}

export type UseAspidaQuery<E extends AspidaEntry, R = GetApiReturn<E>> = (
  options?: UseAspidaQueryOptions
) => R

export type UseAspidaQueryLoadable<
  E extends AspidaEntry,
  R = GetApiReturn<E>
> = (options?: UseAspidaQueryOptions) => Loadable<R>

export type UseAspidaMutation<E extends AspidaEntry> = (
  options?: UseAspidaMutationOptions
) => MutationObj<E>

export type AtomWithAspidaResult<E extends AspidaEntry> = QueryResult<E> &
  MutationResult<E>

export type GetApiOption<E extends AspidaEntry> = NonNullable<
  Parameters<E['$get']>[0]
>

export type GetApiReturn<E extends AspidaEntry> = Awaited<ReturnType<E['$get']>>

export type GetApiObj<
  E extends AspidaEntry,
  QueryParameter = GetApiOption<E>['query'],
  Return = GetApiReturn<E>
> = {
  call: (query: SetterOrUpdater<QueryParameter>) => Promise<Return>
  reload: (query: SetterOrUpdater<QueryParameter>) => Promise<Return>
  refetch: () => Promise<Return>
  waitForSettled: () => Promise<void>
}

export type MutationOptions<T> = {
  rollbackOnError?: boolean
  refetchOnSuccess?: boolean
  optimisticData?: (current: T) => T
  onStart?: (current: T) => void
  onEnd?: (current: T) => void
  onSuccess?: (current: T) => void
  onError?: (current: T) => void
}

type QueryResult<E extends AspidaEntry, R = GetApiReturn<E>> = {
  data: RecoilState<R>
  useQuery: UseAspidaQuery<E>
  useQueryLoadable: UseAspidaQueryLoadable<E>
}

type MutationResult<E extends AspidaEntry> = {
  useMutation: UseAspidaMutation<E>
}

/** merge and purge mutations */
type MutationObj<E extends AspidaEntry> = SpreadTwo<
  GetApi<E>,
  SpreadTwo<
    SpreadTwo<PostApi<E>, PutApi<E>>,
    SpreadTwo<DeleteApi<E>, PatchApi<E>>
  >
>

type MutationMeta = {
  pending: boolean
  success: boolean
  error: Error | undefined
}

type GetApi<E extends AspidaEntry> = E extends {
  $get: AnyPromiseFunc
}
  ? {
      getApi: GetApiObj<E>
    }
  : undefined

type PostApi<E extends AspidaEntry> = E extends {
  $post: infer PostAction
}
  ? PostAction extends AnyPromiseFunc
    ? {
        postApi: MutationMeta & {
          call: (
            payload: Parameters<PostAction>[0] &
              MutationOptions<GetApiReturn<E>>
          ) => ReturnType<PostAction>
        }
      }
    : undefined
  : undefined

type PutApi<E extends AspidaEntry> = E extends { $put: infer PutAction }
  ? PutAction extends AnyPromiseFunc
    ? {
        putApi: MutationMeta & {
          call: (
            payload: Parameters<PutAction>[0] & MutationOptions<GetApiReturn<E>>
          ) => ReturnType<PutAction>
        }
      }
    : undefined
  : undefined

type PatchApi<E extends AspidaEntry> = E extends {
  $patch: infer PatchAction
}
  ? PatchAction extends AnyPromiseFunc
    ? {
        patchApi: MutationMeta & {
          call: (
            payload: Parameters<PatchAction>[0] &
              MutationOptions<GetApiReturn<E>>
          ) => ReturnType<PatchAction>
        }
      }
    : undefined
  : undefined

type DeleteApi<E extends AspidaEntry> = E extends {
  $delete: infer DeleteAction
}
  ? DeleteAction extends AnyPromiseFunc
    ? {
        deleteApi: MutationMeta & {
          call: (
            payload: Parameters<DeleteAction>[0] &
              MutationOptions<GetApiReturn<E>>
          ) => ReturnType<DeleteAction>
        }
      }
    : undefined
  : undefined
