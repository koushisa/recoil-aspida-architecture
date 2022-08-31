import { Box } from '@chakra-ui/react'
import React from 'react'
import { AppSpinnerSuspence } from '@/components/SpinnerSuspence'
import { SubjectFilter } from '@/features/subject/subject.filter'
import { SubjectForm } from '@/features/subject/subject.form'
import { SubjectList } from '@/features/subject/subject.list'
import { aspida } from '@/lib/aspida'
import { atomWithAspida } from '@/lib/recoil/integrations/aspida/atomWithAspida'

export const {
  query: [subjectListState, useSubjects],
  mutation: [useSubjectsMutation],
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
 * Antiと比較すると大部分のロジックをatomWithAspidaに隠蔽した
 * そのおかげで全体の見通しがよくなった
 * Read/Writedで各コンポーネントは独立しており、詳細ロジックもそれぞれに凝集している
 * Rootは本来の責務であるブロック要素の配置やConcurrentなどUXの責務に集中できる
 *
 * atomWithAspidaが内部でやっているロジックの抽象度を下げたバージョンは ../sandbox 参照
 * そちらではキャッシュ管理を自分で定義している
 */
export const SubjectRoot: React.FC = () => {
  const { getApi } = useSubjectsMutation()

  return (
    <>
      <h2>form</h2>
      <Box padding={4}>
        <SubjectForm
          formProps={{
            defaultValues: { name: '', description: '', disabled: false },
          }}
        />
      </Box>

      <h2>list</h2>
      <Box padding={4}>
        <SubjectFilter />

        <AppSpinnerSuspence>
          <SubjectList />
        </AppSpinnerSuspence>
      </Box>
    </>
  )
}
