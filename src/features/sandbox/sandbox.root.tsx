import { Box } from '@chakra-ui/react'
import React from 'react'
import type { Subject } from 'api/api/v1/subjects'
import { AppSpinnerSuspence } from '@/components/SpinnerSuspence'
import { mutate, SubjectsMutationOption } from '@/features/sandbox/mutation'
import { SubjectForm } from '@/features/subject/subject.form'
import { SubjectList } from '@/features/subject/subject.list'
import { aspida } from '@/lib/aspida'
import { atomWithQuery } from '@/lib/recoil/integrations/query/atomWithQuery/atomWithQuery'

type PostInput = SubjectsMutationOption & {
  body: Omit<Subject, 'id'>
}

export const {
  query: [sandboxSubjectsState, useSandboxSubjects],
  mutation: [sandboxSubjectsMutation, useSandboxSubjectsMutation],
} = atomWithQuery({
  key: 'sandboxSubjects',
  query(opts) {
    return aspida.api.v1.subjects.$get()
  },
  mutations: {
    log: (cb) => (obj: any) => {
      const current = cb.snapshot.getLoadable(sandboxSubjectsState).getValue()

      console.log({ current, obj: JSON.stringify(obj) })
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
 * atomWithAspidaが内部でやっているキャッシュ管理ロジックの抽象度を下げたもの
 * Antiの欠点を克服してコンポーネントからロジックを切り出しつつもカスタマイズできるのが利点
 *
 * こちらはキャッシュ管理などを自分で定義するためボイラープレートは増える
 */
export const SandboxSubjectRoot: React.FC = () => {
  const { log } = useSandboxSubjectsMutation()

  return (
    <>
      <h2>sandbox form</h2>
      <SubjectForm
        formProps={{
          defaultValues: { name: '', description: '', disabled: false },
        }}
      />

      <Box margin={4}>
        <button onClick={() => log({ hoge: 'hoge' })}>log</button>
      </Box>

      <h2>sandbox list</h2>
      <AppSpinnerSuspence>
        <SubjectList />
      </AppSpinnerSuspence>
    </>
  )
}
