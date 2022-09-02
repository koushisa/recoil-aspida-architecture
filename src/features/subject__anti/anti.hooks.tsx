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

const rootPath = aspida.api.v1.subjects.$path()

const fetchSubjectList = ({
  queryKey: [, filter],
}: QueryFunctionContext<
  ReturnType<typeof AntiSubjectQuery['Keys']['list']>
>) => {
  return aspida.api.v1.subjects.$get({ query: filter })
}

export const AntiSubjectQuery = {
  Keys: {
    root: rootPath,
    list: (condition: AntiSubjectFilterForm) => [rootPath, condition] as const,
    item: (subjectId: number) => [rootPath, subjectId] as const,
  },

  // https://tkdodo.eu/blog/leveraging-the-query-function-context#object-query-keys

  useListFilterKey: () => {
    const form = useAntiSubjectFilterForm()
    return AntiSubjectQuery.Keys.list(form.watch())
  },

  useList: () => {
    const listKey = AntiSubjectQuery.useListFilterKey()

    const query = useQuery(listKey, fetchSubjectList)

    return query
  },

  useMutation: (options: {
    onSuccess: () => void
    onError: (e: unknown) => void
  }) => {
    const queryClient = useQueryClient()
    const listKey = AntiSubjectQuery.useListFilterKey()

    const post = useMutation(aspida.api.v1.subjects.$post, {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries([rootPath])
        options.onSuccess()
      },
      onError: (err) => {
        options.onError(err)
      },
    })

    // tanstack.com/query/v4/docs/guides/optimistic-updates#updating-a-list-of-todos-when-adding-a-new-todo
    const optimisticPost = useMutation(aspida.api.v1.subjects.$post, {
      onMutate: async (newValue) => {
        await queryClient.cancelQueries([rootPath])

        const prevList =
          queryClient.getQueryData<Subject[]>([rootPath], {
            exact: false,
          }) || []

        queryClient.setQueryData(listKey, [
          ...prevList,
          { id: prevList.length + 1, ...newValue.body },
        ])

        return { prevList }
      },
      onError: (err, _, context) => {
        queryClient.setQueryData([rootPath], context?.prevList)
        options.onError(err)
      },
      onSettled: () => {
        queryClient.invalidateQueries([rootPath])
      },
      onSuccess: () => {
        options.onSuccess()
      },
    })

    return { post, optimisticPost }
  },
}
