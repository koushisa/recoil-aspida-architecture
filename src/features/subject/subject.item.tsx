import { AccordionPanel, Button } from '@chakra-ui/react'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { TextSuspence } from '@/components/TextSuspence'
import { subjectListQuery } from '@/features/subject/subject.root'
import { aspida } from '@/lib/aspida'
import { useAtomWithAspida } from '@/lib/recoil/integrations/aspida/atomWithAspida'

const BODY_HEIGHT = 120

type Props = {
  subjectId: number
}

export const SubjectItem: React.FC<Props> = (props) => {
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

const Comp: React.FC<Props> = ({ subjectId }) => {
  const subjectItemQuery = useAtomWithAspida({
    key: `SubjectItem/${subjectId}`,
    entry: () => {
      return aspida.api.v1.subjects._subjectId(subjectId)
    },
  })

  const listMutation = subjectListQuery.useMutation()
  const { deleteApi } = subjectItemQuery.useMutation({
    onSuccess: () => {
      listMutation.getApi.refetch()
    },
  })

  const subject = subjectItemQuery.useQueryLoadable()
  const { getApi } = subjectItemQuery.useMutation()

  if (subject.state === 'hasError') {
    return (
      <AccordionPanel height={BODY_HEIGHT}>
        <pre style={{ maxHeight: 100, overflow: 'auto' }}>
          {JSON.stringify(subject.errorMaybe(), null, 2)}
        </pre>
      </AccordionPanel>
    )
  }

  return (
    <AccordionPanel height={BODY_HEIGHT}>
      <FormStatus formStatus={deleteApi} />
      <Button onClick={getApi.refetch}>refetche</Button>
      <Button onClick={() => deleteApi.call({ body: { id: subjectId } })}>
        delete
      </Button>
      <pre>{subject.getValue().description}</pre>
    </AccordionPanel>
  )
}
