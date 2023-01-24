import { Box, Checkbox } from '@chakra-ui/react'
import { createRHFContext } from '@/components/Form/shared/BaseInput'
import { AppSpinnerSuspense } from '@/components/SpinnerSuspense'
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
 * キャッシュ管理の複雑さをコンポーネントに露出させたくないので ./hooks にまとめている
 * React Queryのvariablesのために絞り込み検索(Filter)のフォームを露出させないといけないのが悩ましい
 */
export const AntiSubjectRoot = withFormProvider(() => {
  const [isOptimistic, setIsOptimistic] = useState(false)

  return (
    <>
      <h2>anti form</h2>
      <Box padding={4}>
        {isOptimistic ? (
          <AntiSubjectForm_Optimistic
            formProps={{
              defaultValues: {
                name: 'optimistic name',
                description: 'optimistic desc',
                disabled: true,
              },
            }}
          />
        ) : (
          <AntiSubjectForm />
        )}

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

        <AppSpinnerSuspense>
          <AntiSubjectList />
        </AppSpinnerSuspense>
      </Box>
    </>
  )
})
