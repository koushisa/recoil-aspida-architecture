import { Box, Checkbox } from '@chakra-ui/react'
import { createRHFContext } from '@/components/Form/shared/BaseInput'
import { AppSpinnerSuspence } from '@/components/SpinnerSuspence'
import { AntiSubjectFilter } from '@/features/subject__anti/anti.filter'
import { AntiSubjectForm } from '@/features/subject__anti/anti.form'
import { AntiSubjectForm_Optimistic } from '@/features/subject__anti/anti.form.optimistic'
import { AntiSubjectList } from '@/features/subject__anti/anti.list'

export type AntiSubjectFilterForm = {
  name: string | undefined
}

const [useAntiSubjectFilterForm, withFormProvider] =
  createRHFContext<AntiSubjectFilterForm>({
    defaultValues: {
      name: '',
    },
  })

export { useAntiSubjectFilterForm }

/**
 * 状態の整合性を取るために、データとロジックは一元管理したい
 * また、Lifting State UpせずにRead/Writeでコンポーネントを分離するのは素のReactでは難しい
 * ここではあえてRootでLifting State Upしている
 * しかし本質的にはここのロジックは抽象化可能で、コンポーネントから切り出せるのではないか？
 */
export const AntiSubjectRoot = withFormProvider(() => {
  const [isOptimistic, setIsOptimistic] = useState(false)

  return (
    <>
      <h2>anti form</h2>
      <Box padding={4}>
        {isOptimistic ? <AntiSubjectForm_Optimistic /> : <AntiSubjectForm />}

        <Checkbox
          checked={isOptimistic}
          onChange={(_) => {
            setIsOptimistic((v) => !v)
          }}>
          optimistic
        </Checkbox>
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
