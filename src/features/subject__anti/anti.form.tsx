import { Button, Checkbox } from '@chakra-ui/react'
import type {
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'
import { createRHFContext } from '@/components/Form/shared/BaseInput'
import { AntiSubjectQuery } from '@/features/subject__anti/anti.hooks'

type Form = {
  name: string
  description: string
  disabled: boolean
}

const [useSubjectForm, withFormProvider] = createRHFContext<Form>({
  defaultValues: { name: '', description: '', disabled: false },
})

export const AntiSubjectForm = withFormProvider(() => {
  const form = useSubjectForm()

  const { post } = AntiSubjectQuery.useMutation({
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
            success: post.isSuccess,
            error: post.error,
            pending: post.isLoading,
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
        post.mutate({
          body: data,
        })
      }}
      onInValid={(err, evt) => {
        console.log({ err, evt })
      }}
    />
  )
})

export const AntiSubjectFormInput: React.FC<{
  FormStatus: React.ReactNode
  Actions: React.ReactNode
  form: UseFormReturn<Form, any>
  onValid: SubmitHandler<Form>
  onInValid?: SubmitErrorHandler<Form> | undefined
}> = (props) => {
  const { FormStatus, Actions, onValid, onInValid, form } = props

  const { control } = form

  return (
    <form onSubmit={form.handleSubmit(onValid, onInValid)}>
      <>
        <div>
          <ControlledInputText
            label='name'
            placeholder='name'
            controllerProps={{ control, name: 'name' }}
          />
        </div>
        <div>
          <ControlledInputText
            label='description'
            placeholder='description'
            controllerProps={{ control, name: 'description' }}
          />
        </div>
        <div>
          <Checkbox {...form.register('disabled')}>disabled</Checkbox>
        </div>

        <div>{FormStatus}</div>
        <div>{Actions}</div>
      </>
    </form>
  )
}
