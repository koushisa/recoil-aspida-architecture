import { Box, Button } from '@chakra-ui/react'
import React from 'react'
import { useRecoilCallback } from 'recoil'
import type { Subject } from 'api/api/v1/subjects'
import { ErrorDump } from '@/components/ErrorDump/ErrorDump'
import { AppSpinnerSuspence } from '@/components/SpinnerSuspence'
import { AntiSubjectForm } from '@/features/subject__anti/anti.form'
import { AntiSubjectList } from '@/features/subject__anti/anti.list'
import { aspida } from '@/lib/aspida'
import { atomWithAspida } from '@/lib/recoil/integrations/aspida/atomWithAspida'

export const {
  query: [antiSubjectState, useAntiSubjects],
  mutation: [useAntiSubjectsMutation],
} = atomWithAspida({
  entry({ get }) {
    return aspida.api.v1.subjects
  },
  option({ get }, currentOption) {
    return {
      query: currentOption.query,
    }
  },
})

/**
 * 状態の整合性を取るために、データとロジックは一元管理したい
 * また、Lifting State UpせずにRead/Writeでコンポーネントを分離するのは素のReactでは難しい
 * ここではあえてRootでLifting State Upしている
 * しかし本質的にはここのロジックは抽象化可能で、コンポーネントから切り出せるのではないか？
 */
export const AntiSubjectRoot: React.FC = () => {
  // Anti: ここで読み込むとフォームが並列レンダリングできない
  const subjects = useAntiSubjects()

  const { getApi, postApi } = useAntiSubjectsMutation()

  const createSubject = async (data: Omit<Subject, 'id'>) => {
    await postApi.call({
      body: data,
    })

    getApi.refetch()
  }

  const createOptimisticSubject = useRecoilCallback(
    ({ set }) =>
      async (data: Omit<Subject, 'id'>) => {
        set(antiSubjectState, (cur) => [
          ...cur,
          {
            ...data,
            id: cur.length + 1,
          },
        ])
      },
    []
  )

  if (subjects.state === 'hasError') {
    return <ErrorDump error={subjects.errorMaybe()} />
  }

  return (
    <>
      <h2>anti form</h2>
      <Box padding={4}>
        <AntiSubjectForm
          formStatus={postApi}
          onCreate={createSubject}
          onCreateOptimistic={createOptimisticSubject}
        />
      </Box>

      <h2>anti list</h2>
      <Box padding={4}>
        <Button onClick={() => getApi.refetch()}>refetch</Button>
        <AppSpinnerSuspence>
          <AntiSubjectList subjects={subjects.getValue()} />
        </AppSpinnerSuspence>
      </Box>
    </>
  )
}
