import { Box, Checkbox } from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { createRHFContext } from '@/components/Form/shared/BaseInput'
import { AppSpinnerSuspense } from '@/components/SpinnerSuspense'
import { SubjectForm, SubjectFormProps } from '@/features/subject/subject.form'
import { SubjectFormFields } from '@/features/subject/subject.form.fields'
import {
  RQSubjectFilterForm,
  RQSubjectFilterFormProps,
} from '@/features/subject__rq/rq.filter'
import { RQSubjectQuery } from '@/features/subject__rq/rq.hooks'
import { RQSubjectList } from '@/features/subject__rq/rq.list'

export type RQSubjectFilterFormValues = {
  name: string | undefined
}

const [useRQSubjectFilterForm, withFormProvider] =
  createRHFContext<RQSubjectFilterFormValues>({
    defaultValues: {
      name: '',
    },
  })

export { useRQSubjectFilterForm }

export const RQSubjectRoot = withFormProvider(() => {
  const filterForm = useRQSubjectFilterForm()
  const [isOptimistic, setIsOptimistic] = useState(false)

  const queryClient = useQueryClient()

  const { post, optimisticPost } = RQSubjectQuery.useMutation({
    onSuccess() {
      alert('post success')
    },
    onError(e) {
      alert('post error ')
      console.log({ e })
    },
  })

  const formProps: SubjectFormProps = {
    formProps: {
      defaultValues: { name: '', description: '', disabled: false },
    },
    onValid: (body) => {
      return post.mutate({
        body,
      })
    },
    onInValid: (err, evt) => {
      console.log({ err, evt })
    },
    Fields: (form) => <SubjectFormFields form={form} />,
  }

  const optimisticFormProps: SubjectFormProps = {
    ...formProps,

    // optimistic update
    onValid: (body) => {
      return optimisticPost.mutate({
        body,
      })
    },
  }

  const filterProps: RQSubjectFilterFormProps = {
    formProps: {
      defaultValues: { name: '' },
    },
    onValid: (body) => {
      filterForm.reset(body)
    },
  }

  const onItemDeleted = () => {
    return queryClient.invalidateQueries([RQSubjectQuery.Keys.root])
  }

  return (
    <>
      <h2>react query form</h2>

      <Checkbox
        checked={isOptimistic}
        onChange={(_) => {
          setIsOptimistic((v) => !v)
        }}>
        optimistic
      </Checkbox>

      <Box padding={4}>
        {isOptimistic ? (
          <SubjectForm {...optimisticFormProps} />
        ) : (
          <SubjectForm {...formProps} />
        )}
      </Box>

      <h2>react query list</h2>
      <Box padding={4}>
        <RQSubjectFilterForm {...filterProps} />

        <AppSpinnerSuspense>
          <RQSubjectList onItemDeleted={onItemDeleted} />
        </AppSpinnerSuspense>
      </Box>
    </>
  )
})
