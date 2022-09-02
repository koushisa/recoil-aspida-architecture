import { Button } from '@chakra-ui/react'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { createRHFContext } from '@/components/Form/shared/BaseInput'
import { AntiSubjectFormInput } from '@/features/subject__anti/anti.form'
import { AntiSubjectQuery } from '@/features/subject__anti/anti.hooks'

type Form = {
  name: string
  description: string
  disabled: boolean
}

const [useSubjectForm, withFormProvider] = createRHFContext<Form>({
  defaultValues: { name: '', description: '', disabled: false },
})

export const AntiSubjectForm_Optimistic = withFormProvider(() => {
  const form = useSubjectForm()

  const { optimisticPost } = AntiSubjectQuery.useMutation({
    onSuccess() {
      alert('post success')
      form.reset()
    },
    onError(e) {
      alert('post error ')
      console.log({ e })
    },
  })

  return (
    <AntiSubjectFormInput
      FormStatus={
        <FormStatus
          formStatus={{
            success: optimisticPost.isSuccess,
            error: optimisticPost.error,
            pending: optimisticPost.isLoading,
          }}
        />
      }
      Actions={
        <>
          <Button type='submit'>CREATE</Button>
        </>
      }
      form={form}
      onValid={(data) => {
        optimisticPost.mutate({
          body: data,
        })
      }}
      onInValid={(err, evt) => {
        console.log({ err, evt })
      }}
    />
  )
})
