import { Button } from '@chakra-ui/react'
import React from 'react'
import {
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
  UseFormProps,
} from 'react-hook-form'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'

type SubjectFilterFormValues = {
  name: string | undefined
}

export type SubjectFilterFormProps = {
  formProps: UseFormProps<SubjectFilterFormValues, any>
  onValid: SubmitHandler<SubjectFilterFormValues>
  onInValid?: SubmitErrorHandler<SubjectFilterFormValues> | undefined
}

export const SubjectFilterForm: React.FC<SubjectFilterFormProps> = (props) => {
  const { formProps, onValid, onInValid } = props

  const form = useForm<SubjectFilterFormValues>(formProps)
  const { control, handleSubmit } = form

  return (
    <form onSubmit={handleSubmit(onValid, onInValid)}>
      <div>
        <ControlledInputText
          label='filter name'
          placeholder='filter name'
          controllerProps={{ control, name: 'name' }}
        />
      </div>

      <Button type='submit'>filter response</Button>
    </form>
  )
}
