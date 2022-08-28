import { AccordionPanel } from '@chakra-ui/react'
import { TextSuspence } from '@/components/TextSuspence'
import { aspida } from '@/lib/aspida'
import { atomWithQueryFamily } from '@/lib/recoil/integrations/query/atomWithQuery/atomWithQuery'

const {
  query: [state, useSandboxSubject],
  mutation: [_, __],
} = atomWithQueryFamily({
  query: (id: number) => () => {
    return aspida.api.v1.subjects._subjectId(id).$get()
  },
  mutations: (param) => {
    return {
      testCallbackWithFamily: (s) => (obj: { id: number; fuga: string }) => {
        const current = s.snapshot.getLoadable(state(param)).getValue()

        console.log({ param, current, obj: JSON.stringify(obj) })
      },
    }
  },
})

const BODY_HEIGHT = 120

type Props = {
  subjectId: number
}

export const SandboxSubjectItem: React.FC<Props> = (props) => {
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

  const subject = useSandboxSubject({
    param: subjectId,
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
