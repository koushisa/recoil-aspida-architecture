import { Button, Checkbox } from '@chakra-ui/react'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'
import { createRHFContext } from '@/components/Form/shared/BaseInput'
import { AntiSubjectQuery } from '@/features/subject__anti/anti.hooks'

type Form = {
  name: string
  description: string
  disabled: boolean
}

const [useSubjectForm, withFormProvider] = createRHFContext<Form>()

export const AntiSubjectForm = withFormProvider(() => {
  const form = useSubjectForm()

  const { post, optimisticPost } = AntiSubjectQuery.useMutation({
    onSuccess() {
      alert('post success')
      form.reset()
    },
    onError(e) {
      alert('post error ')
      console.log({ e })
    },
  })

  const [isOptimistic, setIsOptimistic] = useState(false)

  return (
    <AntiSubjectFormInput
      FormStatus={
        <FormStatus
          formStatus={
            isOptimistic
              ? {
                  success: optimisticPost.isSuccess,
                  error: optimisticPost.error,
                  pending: optimisticPost.isLoading,
                }
              : {
                  success: post.isSuccess,
                  error: post.error,
                  pending: post.isLoading,
                }
          }
        />
      }
      Actions={
        <>
          <Button type='submit'>CREATE</Button>
          <Checkbox
            checked={isOptimistic}
            onChange={(_) => {
              setIsOptimistic((v) => !v)
            }}>
            optimistic
          </Checkbox>
        </>
      }
      onValid={(data) => {
        if (isOptimistic) {
          // 動かない
          optimisticPost.mutate({
            body: data,
          })
        } else {
          post.mutate({
            body: data,
          })
        }
      }}
      onInValid={(err, evt) => {
        console.log({ err, evt })
      }}
    />
  )
})

const AntiSubjectFormInput: React.FC<{
  FormStatus: React.ReactNode
  Actions: React.ReactNode
  onValid: SubmitHandler<Form>
  onInValid?: SubmitErrorHandler<Form> | undefined
}> = (props) => {
  const { FormStatus, Actions, onValid, onInValid } = props

  const form = useSubjectForm()
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
