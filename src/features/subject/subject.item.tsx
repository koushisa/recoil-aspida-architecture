import { AccordionPanel, Button } from '@chakra-ui/react'
import { ErrorDump } from '@/components/ErrorDump/ErrorDump'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { TextSuspense } from '@/components/TextSuspense'
import { aspida } from '@/lib/aspida'
import { useAtomWithAspida } from '@/lib/recoil/integrations/aspida/atomWithAspida'

const BODY_HEIGHT = 120

type Props = {
  subjectId: number
  onItemDeleted: () => void
}

export const SubjectItem: React.FC<Props> = (props) => {
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

const Item: React.FC<Props> = ({ subjectId, onItemDeleted }) => {
  const subjectItemQuery = useAtomWithAspida({
    key: `SubjectItem/${subjectId}`,
    entry: () => {
      return aspida.api.v1.subjects._subjectId(subjectId)
    },
  })

  const subjectItem = subjectItemQuery.useQueryLoadable()
  const { getApi } = subjectItemQuery.useMutation()
  const { deleteApi } = subjectItemQuery.useMutation({
    onSuccess: () => {
      onItemDeleted()
    },
  })

  if (subjectItem.state === 'hasError') {
    return (
      <AccordionPanel height={BODY_HEIGHT}>
        <ErrorDump error={subjectItem.errorMaybe()} />
      </AccordionPanel>
    )
  }

  return (
    <AccordionPanel height={BODY_HEIGHT}>
      <FormStatus formStatus={deleteApi} />
      <Button onClick={getApi.refetch}>refetch</Button>
      <Button onClick={() => deleteApi.call({ body: { id: subjectId } })}>
        delete
      </Button>
      <pre>{subjectItem.getValue().description}</pre>
    </AccordionPanel>
  )
}
