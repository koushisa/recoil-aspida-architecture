import { AccordionPanel, Button } from '@chakra-ui/react'
import { TextSuspence } from '@/components/TextSuspence'
import { aspida } from '@/lib/aspida'
import { atomWithQueryFamily } from '@/lib/recoil/integrations/query/atomWithQuery/atomWithQuery'

const {
  query: [state, useSandboxSubjectItem],
  mutation: [_, useSandboxSubjectItemMutation],
} = atomWithQueryFamily({
  query: (id: number) => () => {
    return aspida.api.v1.subjects._subjectId(id).$get()
  },
  mutations: (id) => {
    return {
      log: (s) => (obj) => {
        const current = s.snapshot.getLoadable(state(id)).getValue()

        console.log({ param: id, current, obj: JSON.stringify(obj) })
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

  const subject = useSandboxSubjectItem({
    param: subjectId,
    keepPrevious: false,
  })

  const { refetch, log } = useSandboxSubjectItemMutation(subjectId)

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
      <Button onClick={refetch}>refetch</Button>
      <Button
        onClick={() =>
          log({
            hoge: 'hoge',
          })
        }>
        log
      </Button>
      <pre>{subject.getValue().description}</pre>
    </AccordionPanel>
  )
}
