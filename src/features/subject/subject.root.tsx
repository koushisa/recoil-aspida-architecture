import { Box, Button } from '@chakra-ui/react'
import React from 'react'
import { AppSpinnerSuspence } from '@/components/SpinnerSuspence'
import { SubjectForm } from '@/features/subject/subject.form'
import { SubjectList } from '@/features/subject/subject.list'
import { aspida } from '@/lib/aspida'
import { atomWithAspida } from '@/lib/recoil/integrations/aspida/atomWithAspida'

export const {
  query: [_, useSubjects],
  mutation: [useSubjectsMutation],
} = atomWithAspida({
  entry({ get }) {
    // dependencies
    // const tenantId = get(tenantIdState)
    // return aspida.api.v1.tenant._tenantId(tenantId).subjects

    return aspida.api.v1.subjects
  },
  option({ get }, current) {
    // const query = get(subjectQueryState)

    return {
      query: {},
    }
  },
  // disabled(opts, currentOption) {
  //   // currentOptions
  //   currentOption.query?.disabled

  //   // dependencies
  //   const disabled = opts.get(/* ~*/)

  //   return disabled
  // },
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
      <SubjectForm
        formProps={{
          defaultValues: { name: '', description: '', disabled: false },
        }}
      />

      <Box margin={4} />

      <Button onClick={() => getApi.refetch()}>refetch</Button>

      <h2>list</h2>
      <AppSpinnerSuspence>
        <SubjectList />
      </AppSpinnerSuspence>
    </>
  )
}
