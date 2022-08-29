import { Button, Checkbox } from '@chakra-ui/react'
import {
  SubmitErrorHandler,
  SubmitHandler,
  FormProvider,
  useForm,
  UseFormProps,
  useFormContext,
} from 'react-hook-form'
import type React from 'react'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'
import { useSandboxSubjectsMutation } from '@/features/sandbox/sandbox.root'

type Form = {
  name: string
  description: string
  disabled: boolean
}

type SubjectFormProps = {
  formProps: UseFormProps<Form, any>
}

const useSubjectForm = () => useFormContext<Form>()
const Wrapper: React.FC<SubjectFormProps> = ({ formProps }) => {
  const form = useForm<Form>(formProps)

  return (
    <FormProvider {...form}>
      <SubjectForm />
    </FormProvider>
  )
}

const SubjectForm: React.FC = () => {
  const { post: postApi, log } = useSandboxSubjectsMutation()
  const form = useSubjectForm()
  const [isOptimistic, setIsOptimistic] = useState(false)

  return (
    <SubjectFormInput
      FormStatus={null}
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
        log(data)

        postApi({
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

          onSuccess(current) {
            console.log({ success: current })
            form.reset()
          },
          onStart(current) {
            console.log({ start: current })
          },
          onError(current) {
            console.log({ err: current })
          },
          onEnd(current) {
            console.log({ end: current })
          },
        })
      }}
      onInValid={(err, evt) => {
        console.log({ err, evt })
      }}
    />
  )
}

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

export { Wrapper as SandBoxSubjectForm }
