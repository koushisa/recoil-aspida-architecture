import { Button, Checkbox } from '@chakra-ui/react'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'
import { createRHFContext } from '@/components/Form/shared/BaseInput'

type Form = {
  name: string
  description: string
  disabled: boolean
}

type AntiSubjectFormProps = {
  formStatus: FormStatus
  onCreate: (data: Form) => Promise<void>
  onCreateOptimistic: (data: Form) => Promise<void>
}

const [useSubjectForm, withFormProvider] = createRHFContext<
  Form,
  AntiSubjectFormProps
>()

export const AntiSubjectForm = withFormProvider<AntiSubjectFormProps>(
  ({ formStatus, onCreate, onCreateOptimistic }) => {
    const [isOptimistic, setIsOptimistic] = useState(false)

    const form = useSubjectForm()

    return (
      <div>
        <AntiSubjectFormInput
          FormStatus={<FormStatus formStatus={formStatus} />}
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
            try {
              if (isOptimistic) {
                onCreateOptimistic(data)
              } else {
                onCreate(data)
              }
            } catch (error) {
              console.log({ error })
            } finally {
              form.reset()
            }
          }}
          onInValid={(err, evt) => {
            console.log({ err, evt })
          }}
        />
      </div>
    )
  }
)

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
