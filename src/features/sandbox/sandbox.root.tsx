import { Box, Button } from '@chakra-ui/react'
import React from 'react'
import type { Subject } from 'api/api/v1/subjects'
import { AppSpinnerSuspence } from '@/components/SpinnerSuspence'
import { mutate, SubjectsMutationOption } from '@/features/sandbox/mutation'
import { SandboxSubjectFilter } from '@/features/sandbox/sandbox.filter'
import { SandboxSubjectForm } from '@/features/sandbox/sandbox.form'
import { SandboxSubjectList } from '@/features/sandbox/sandbox.list'
import { aspida } from '@/lib/aspida'
import { atomWithQuery } from '@/lib/recoil/integrations/query/atomWithQuery/atomWithQuery'

type PostInput = SubjectsMutationOption & {
  body: Omit<Subject, 'id'>
}

type ReloadInput = { name: string | undefined }

export const {
  query: [sandboxSubjectsState, useSandboxSubjects],
  mutation: [sandboxSubjectsMutation, useSandboxSubjectsMutation],
} = atomWithQuery({
  key: 'sandboxSubjects',
  query(opts) {
    return aspida.api.v1.subjects.$get()
  },
  mutations: {
    log: (cb) => (obj) => {
      const current = cb.snapshot.getLoadable(sandboxSubjectsState).getValue()

      console.log({ current, obj: JSON.stringify(obj) })
    },
    reload:
      (cb) =>
      async ({ name }: ReloadInput) => {
        const res = await aspida.api.v1.subjects.$get({
          query: {
            name,
          },
        })

        cb.set(sandboxSubjectsState, res)

        return res
      },
    post: (cb) => (input: PostInput) => {
      const { body, ...option } = input

      return mutate({
        mutation: () => aspida.api.v1.subjects.$post({ body }),
        queryState: sandboxSubjectsState,
        recoilCallback: cb,
        getApi: cb.snapshot.getLoadable(sandboxSubjectsMutation).getValue(),
        option,
      })
    },
  },
})

/**
 * atomWithQueryを利用し、キャッシュ管理ロジックをデータフローグラフに定義したパターン
 * Anti(React-Query)と比較するとキャッシュキーによる管理がなくなり、Recoilのデータフローグラフに移譲できるのが利点で大部分のボイラープレートやカスタムフックが不要となる
 * Antiではキャッシュキーのために必要だったFilter用のフォームではこのパターンでは不要となるのはポイント
 * なにがどう依存しているかはデータフローグラフが全て知っている
 *
 * atomWithAspidaと比較するとpostなどの処理を自分で定義する分のボイラープレートは増える
 */
export const SandboxSubjectRoot: React.FC = () => {
  const { log, refetch } = useSandboxSubjectsMutation()

  return (
    <>
      <h2>sandbox form</h2>
      <Box padding={4}>
        <SandboxSubjectForm
          formProps={{
            defaultValues: { name: '', description: '', disabled: false },
          }}
        />
      </Box>

      <h2>sandbox list</h2>
      <Box padding={4}>
        <SandboxSubjectFilter />
        <Button onClick={refetch}>refetch</Button>
        <Button onClick={log}>log current state</Button>

        <AppSpinnerSuspence>
          <SandboxSubjectList />
        </AppSpinnerSuspence>
      </Box>
    </>
  )
}
