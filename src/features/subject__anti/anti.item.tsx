import { AccordionPanel, Button } from '@chakra-ui/react'
import {
  QueryFunctionContext,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { TextSuspence } from '@/components/TextSuspence'
import { AntiSubjectQuery } from '@/features/subject__anti/anti.hooks'

import { aspida } from '@/lib/aspida'

type Props = {
  subjectId: number
}

const fetchSubjectItem = async ({
  queryKey: [, subjectId],
}: QueryFunctionContext<
  ReturnType<typeof AntiSubjectQuery['Keys']['item']>
>) => {
  return await aspida.api.v1.subjects._subjectId(subjectId).$get()
}

const BODY_HEIGHT = 120

export const AntiSubjectItem: React.FC<Props> = (props) => {
  return (
    <TextSuspence
      boxProps={{
        padding: '4',
        height: BODY_HEIGHT,
      }}
      skeletonTextProps={{ noOfLines: 4 }}>
      <Comp {...props} />
    </TextSuspence>
  )
}

const Comp: React.FC<Props> = (props) => {
  const { subjectId } = props

  const queryClient = useQueryClient()

  const query = useQuery(
    AntiSubjectQuery.Keys.item(subjectId),
    fetchSubjectItem,
    {
      suspense: true,
    }
  )

  const deleteApi = useMutation(
    aspida.api.v1.subjects._subjectId(subjectId).$delete,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([AntiSubjectQuery.Keys.root])
      },
    }
  )

  if (query.error) {
    return (
      <AccordionPanel height={BODY_HEIGHT}>
        <pre style={{ maxHeight: 100, overflow: 'auto' }}>
          {JSON.stringify(query.error, null, 2)}
        </pre>
      </AccordionPanel>
    )
  }

  return (
    <AccordionPanel height={BODY_HEIGHT}>
      <FormStatus
        formStatus={{
          success: deleteApi.isSuccess,
          error: deleteApi.error,
          pending: deleteApi.isLoading,
        }}
      />
      <Button onClick={() => query.refetch()}>refetch</Button>
      <Button onClick={() => deleteApi.mutate({ body: { id: subjectId } })}>
        delete
      </Button>
      <pre>{query.data?.description}</pre>
    </AccordionPanel>
  )
}
