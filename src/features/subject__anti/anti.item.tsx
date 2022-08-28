import { AccordionPanel } from '@chakra-ui/react'
import type { Subject } from 'api/api/v1/subjects'
import { TextSuspence } from '@/components/TextSuspence'
import { aspida } from '@/lib/aspida'
import { atomWithQueryFamily } from '@/lib/recoil/integrations/query/atomWithQuery/atomWithQuery'

type Props = {
  subject: Subject
}

const {
  query: [_, useSubject],
} = atomWithQueryFamily({
  query: (id: number) => () => {
    return aspida.api.v1.subjects._subjectId(id).$get()
  },
})

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
  const {
    subject: { id },
  } = props

  const subject = useSubject({
    param: id,
    keepPrevious: false,
  })

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
      <pre>{subject.getValue().description}</pre>
    </AccordionPanel>
  )
}
