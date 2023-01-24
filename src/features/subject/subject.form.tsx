import { Button } from '@chakra-ui/react'
import {
  useForm,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form'

export type SubjectFormValues = {
  name: string
  description: string
  disabled: boolean
}

export type SubjectFormProps = {
  formProps: UseFormProps<SubjectFormValues, any>
  Fields: (form: UseFormReturn<SubjectFormValues, any>) => React.ReactNode
  onValid: SubmitHandler<SubjectFormValues>
  onInValid?: SubmitErrorHandler<SubjectFormValues> | undefined
}

export const SubjectForm: React.FC<SubjectFormProps> = (props) => {
  const { formProps, Fields, onValid, onInValid } = props

  const form = useForm<SubjectFormValues>(formProps)

  const handleOnValid: SubmitHandler<SubjectFormValues> = (...arg) => {
    onValid(...arg).then(() => {
      form.reset()
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleOnValid, onInValid)}>
      {Fields(form)}
      <Button type='submit'>CREATE</Button>
    </form>
  )
}
