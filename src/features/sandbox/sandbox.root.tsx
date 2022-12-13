import { Box, Button } from '@chakra-ui/react'
import React from 'react'
import type { MutationOption } from '@/lib/recoil/integrations/query/atomWithQuery/utils/mutate'
import type { Subject } from 'api/api/v1/subjects'
import { AppSpinnerSuspence } from '@/components/SpinnerSuspence'
import { SandboxSubjectFilter } from '@/features/sandbox/sandbox.filter'
import { SandboxSubjectForm } from '@/features/sandbox/sandbox.form'
import { SandboxSubjectList } from '@/features/sandbox/sandbox.list'
import { aspida } from '@/lib/aspida'
import { atomWithQuery } from '@/lib/recoil/integrations/query/atomWithQuery/atomWithQuery'

type PostInput = MutationOption<Subject[]> & {
  body: Omit<Subject, 'id'>
}

type ReloadInput = { name: string | undefined }

export const sandBoxSubjectList = atomWithQuery({
  key: 'sandboxSubjects',
  query: (opts) => {
    return aspida.api.v1.subjects.$get()
  },
  mutations: {
    log: (cb) => (extraObj) => {
      const current = cb.snapshot
        .getLoadable(sandBoxSubjectList.data)
        .getValue()

      console.log({ current, extraObj: JSON.stringify(extraObj) })
    },
    reload:
      (cb) =>
      async ({ name }: ReloadInput) => {
        const res = await aspida.api.v1.subjects.$get({
          query: {
            name,
          },
        })

        cb.set(sandBoxSubjectList.data, res)

        return res
      },
    post: (cb) => (input: PostInput) => {
      const { body, ...option } = input

      cb.snapshot
        .getLoadable(sandBoxSubjectList.mutation)
        .getValue()
        .mutate({
          ...option,
          mutationFn: () => aspida.api.v1.subjects.$post({ body }),
        })
    },
  },
})

/**
 * atomWithQueryを利用し、キャッシュ管理ロジックをデータフローグラフに定義したパターン
 * Anti(React-Query)と比較するとキャッシュキーによる管理がなくなり、Recoilのデータフローグラフに移譲できるのが利点で大部分のボイラープレートやカスタムフックが不要となる
 * Antiで必要だったFilter用のフォームがこのパターンでは不要となるのはポイント
 * なにがどう依存しているかはデータフローグラフが全て知っている
 *
 * atomWithAspidaと比較するとpostなどの処理を自分で定義する分のボイラープレートは増える
 */
export const SandboxSubjectRoot: React.FC = () => {
  const { log, refetch } = sandBoxSubjectList.useMutation()

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
        <Button onClick={() => log({ hoge: 'hoge' })}>log current state</Button>

        <AppSpinnerSuspence>
          <SandboxSubjectList />
        </AppSpinnerSuspence>
      </Box>
    </>
  )
}
