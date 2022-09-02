import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryFunctionContext,
} from '@tanstack/react-query'
import type { Subject } from 'api/api/v1/subjects'
import {
  AntiSubjectFilterForm,
  useAntiSubjectFilterForm,
} from '@/features/subject__anti/anti.root'
import { aspida } from '@/lib/aspida'

const path = aspida.api.v1.subjects.$path()

const fetchSubjectList = async ({
  queryKey: [, filter],
}: QueryFunctionContext<
  ReturnType<typeof AntiSubjectQuery['Keys']['filterList']>
>) => {
  console.log({ filter })
  return await aspida.api.v1.subjects.$get({ query: filter })
}

export const AntiSubjectQuery = {
  // https://tkdodo.eu/blog/leveraging-the-query-function-context#object-query-keys
  Keys: {
    filterList: (filter: AntiSubjectFilterForm) => [path, filter] as const,
    item: (subjectId: number) => [path, subjectId] as const,
  },

  useListFilterKey: () => {
    const form = useAntiSubjectFilterForm()

    const getKey = useCallback(() => {
      return AntiSubjectQuery.Keys.filterList(form.getValues())
    }, [form])

    return getKey
  },

  useList: () => {
    const form = useAntiSubjectFilterForm()

    const query = useQuery(
      AntiSubjectQuery.Keys.filterList(form.watch()),
      fetchSubjectList,
      {
        suspense: true,
      }
    )

    return query
  },

  useMutation: (options: {
    onSuccess: () => void
    onError: (e: unknown) => void
  }) => {
    // Access the client
    const queryClient = useQueryClient()
    const getListKey = AntiSubjectQuery.useListFilterKey()

    // Mutations
    const post = useMutation(aspida.api.v1.subjects.$post, {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(getListKey())
        options.onSuccess()
      },
      onError: (err) => {
        options.onError(err)
      },
    })

    // tanstack.com/query/v4/docs/guides/optimistic-updates#updating-a-list-of-todos-when-adding-a-new-todo
    const optimisticPost = useMutation(aspida.api.v1.subjects.$post, {
      // When mutate is called:
      onMutate: async (newValue) => {
        const listKey = getListKey()

        console.log(listKey)

        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(listKey)

        // Snapshot the previous value
        const prevList = queryClient.getQueryData<Subject[]>(listKey)

        // Optimistically update to the new value
        queryClient.setQueryData<Subject[]>(listKey, (current) => {
          console.log({ prevList, current })
          if (prevList === undefined) {
            return [{ id: 1, ...newValue.body }]
          }

          const optimisticData = [
            ...prevList,
            { id: prevList.length + 1, ...newValue.body },
          ]

          console.log({ optimisticData })

          return optimisticData
        })

        console.log({ prevList })

        // Return a context object with the snapshotted value
        return { prevList }
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (err, _, context) => {
        queryClient.setQueryData(getListKey(), context?.prevList)
        options.onError(err)
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(getListKey())
      },
      onSuccess: () => {
        options.onSuccess()
      },
    })

    return { post, optimisticPost }
  },
}
