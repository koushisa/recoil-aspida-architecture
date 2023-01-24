import { Button } from '@chakra-ui/react'
import React from 'react'
import {
  SubmitHandler,
  SubmitErrorHandler,
  useForm,
  UseFormProps,
} from 'react-hook-form'
import type { RQSubjectFilterFormValues } from '@/features/subject__rq/rq.root'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'

export type RQSubjectFilterFormProps = {
  formProps: UseFormProps<RQSubjectFilterFormValues, any>
  onValid: SubmitHandler<RQSubjectFilterFormValues>
  onInValid?: SubmitErrorHandler<RQSubjectFilterFormValues> | undefined
}

export const RQSubjectFilterForm: React.FC<RQSubjectFilterFormProps> = (
  props
) => {
  const { formProps, onValid, onInValid } = props

  const form = useForm<RQSubjectFilterFormValues>(formProps)
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
