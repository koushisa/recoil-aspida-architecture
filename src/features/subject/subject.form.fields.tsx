import { Checkbox } from '@chakra-ui/react'
import type { SubjectFormValues } from '@/features/subject/subject.form'
import type { UseFormReturn } from 'react-hook-form'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'

export const SubjectFormFields: React.FC<{
  form: UseFormReturn<SubjectFormValues, any>
}> = (props) => {
  const { form } = props
  const { control } = form

  return (
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
    </>
  )
}
