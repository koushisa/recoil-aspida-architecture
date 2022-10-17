import { AccordionPanel, Button } from '@chakra-ui/react'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { TextSuspence } from '@/components/TextSuspence'
import { sandBoxSubjectList } from '@/features/sandbox/sandbox.root'
import { aspida } from '@/lib/aspida'
import { usePromise } from '@/lib/recoil/integrations/aspida/utils/usePromise'
import { atomWithQueryFamily } from '@/lib/recoil/integrations/query/atomWithQuery/atomWithQuery'

const subjectQuery = atomWithQueryFamily({
  query: (id: number) => () => {
    return aspida.api.v1.subjects._subjectId(id).$get()
  },
  mutations: (id) => {
    return {
      log: (s) => (obj) => {
        const current = s.snapshot
          .getLoadable(subjectQuery.query(id))
          .getValue()

        console.log({ param: id, current, obj: JSON.stringify(obj) })
      },
      callDelete: (cb) => async () => {
        await aspida.api.v1.subjects._subjectId(id).$delete({
          body: { id },
        })

        cb.reset(sandBoxSubjectList.query)
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

  const subject = subjectQuery.useQueryLoadable({
    param: subjectId,
    keepPrevious: false,
  })

  const { refetch, log, callDelete } = subjectQuery.useMutation(subjectId)
  const deleteApi = usePromise(callDelete)

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
      <Button onClick={refetch}>refetch</Button>
      <Button onClick={() => deleteApi.call()}>delete</Button>
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
