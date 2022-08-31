import { Box } from '@chakra-ui/react'
import { createRHFContext } from '@/components/Form/shared/BaseInput'
import { AppSpinnerSuspence } from '@/components/SpinnerSuspence'
import { AntiSubjectFilter } from '@/features/subject__anti/anti.filter'
import { AntiSubjectForm } from '@/features/subject__anti/anti.form'
import { AntiSubjectList } from '@/features/subject__anti/anti.list'

export type AntiSubjectFilterForm = {
  name: string | undefined
}

const ctx = createRHFContext<AntiSubjectFilterForm>({
  defaultValues: {
    name: '',
  },
})

const [, withFormProvider] = ctx
export const [useAntiSubjectFilterForm] = ctx

/**
 * 状態の整合性を取るために、データとロジックは一元管理したい
 * また、Lifting State UpせずにRead/Writeでコンポーネントを分離するのは素のReactでは難しい
 * ここではあえてRootでLifting State Upしている
 * しかし本質的にはここのロジックは抽象化可能で、コンポーネントから切り出せるのではないか？
 */
export const AntiSubjectRoot = withFormProvider(() => {
  return (
    <>
      <h2>anti form</h2>
      <Box padding={4}>
        <AntiSubjectForm
          formProps={{
            defaultValues: { name: '', description: '', disabled: false },
          }}
        />
      </Box>

      <h2>anti list</h2>
      <Box padding={4}>
        <AntiSubjectFilter />

        <AppSpinnerSuspence>
          <AntiSubjectList />
        </AppSpinnerSuspence>
      </Box>
    </>
  )
})
