import { Box } from '@chakra-ui/react'
import React from 'react'
import { AppSpinnerSuspense } from '@/components/SpinnerSuspense'
import { SubjectFilter } from '@/features/subject/subject.filter'
import { SubjectForm } from '@/features/subject/subject.form'
import { SubjectList } from '@/features/subject/subject.list'
import { aspida } from '@/lib/aspida'
import { atomWithAspida } from '@/lib/recoil/integrations/aspida/atomWithAspida'

export const subjectListQuery = atomWithAspida({
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
 * anti, sandboxと比較すると大部分のロジックがatomWithAspidaに隠蔽された
 * そのおかげで全体の見通しがよくなった
 * Read/Writedで各コンポーネントは独立しており、詳細ロジックもそれぞれに凝集し、
 * Rootは本来の責務であるブロック要素の配置やConcurrentなどUXの責務に集中できる
 *
 * atomWithAspidaが内部でやっているロジックの抽象度を下げたバージョンは ../sandbox 参照
 * そちらではキャッシュ管理を自分で定義している
 */
export const SubjectRoot: React.FC = () => {
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

        <AppSpinnerSuspense>
          <SubjectList />
        </AppSpinnerSuspense>
      </Box>
    </>
  )
}
