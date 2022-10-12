import { Button, Checkbox } from '@chakra-ui/react'
import type React from 'react'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'
import { createRHFContext } from '@/components/Form/shared/BaseInput'
import { subjectListQuery } from '@/features/subject/subject.root'

type Form = {
  name: string
  description: string
  disabled: boolean
}

const [useSubjectForm, withFormProvider] = createRHFContext<Form>()

export const SubjectForm = withFormProvider(() => {
  const form = useSubjectForm()

  const { postApi } = subjectListQuery.useMutation({
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
    <SubjectFormInput
      FormStatus={<FormStatus formStatus={{ ...postApi }} />}
      Actions={
        <>
          <Button type='submit'>CREATE</Button>
          <Checkbox
            checked={isOptimistic}
            onChange={(_) => {
              setIsOptimistic(!isOptimistic)
            }}>
            optimistic
          </Checkbox>
        </>
      }
      onValid={(data) => {
        postApi.call({
          body: data,
          ...(isOptimistic
            ? // for optimisticUpdate
              {
                refetchOnSuccess: false,
                rollbackOnError: true,
                optimisticData(current) {
                  return [...current, { ...data, id: current.length + 1 }]
                },
              }
            : {
                refetchOnSuccess: true,
              }),
        })
      }}
      onInValid={(err, evt) => {
        console.log({ err, evt })
      }}
    />
  )
})

const SubjectFormInput: React.FC<{
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
