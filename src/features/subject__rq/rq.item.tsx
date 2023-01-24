import { AccordionPanel, Button } from '@chakra-ui/react'
import {
  QueryFunctionContext,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { ErrorDump } from '@/components/ErrorDump/ErrorDump'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { TextSuspense } from '@/components/TextSuspense'
import { RQSubjectQuery } from '@/features/subject__rq/rq.hooks'
import { aspida } from '@/lib/aspida'

type Props = {
  subjectId: number
  onItemDeleted: () => void
}

const fetchSubjectItem = ({
  queryKey: [, subjectId],
}: QueryFunctionContext<ReturnType<typeof RQSubjectQuery['Keys']['item']>>) => {
  return aspida.api.v1.subjects._subjectId(subjectId).$get()
}

const BODY_HEIGHT = 120

export const RQSubjectItem: React.FC<Props> = (props) => {
  return (
    <TextSuspense
      boxProps={{
        padding: '4',
        height: BODY_HEIGHT,
      }}
      skeletonTextProps={{ noOfLines: 4 }}>
      <Item {...props} />
    </TextSuspense>
  )
}

const Item: React.FC<Props> = (props) => {
  const { subjectId, onItemDeleted } = props

  const query = useQuery(
    RQSubjectQuery.Keys.item(subjectId),
    fetchSubjectItem,
    {
      suspense: true,
    }
  )

  const deleteApi = useMutation(
    aspida.api.v1.subjects._subjectId(subjectId).$delete,
    {
      onSuccess: () => {
        onItemDeleted()
      },
    }
  )

  if (query.error) {
    return (
      <AccordionPanel height={BODY_HEIGHT}>
        <ErrorDump error={query.error} />
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
