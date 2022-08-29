import { Button } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'
import { useSubjectsMutation } from '@/features/subject/subject.root'

type Filter = {
  name: string | undefined
}

const defaultValues: Filter = {
  name: '',
}

export const SubjectFilter: React.FC = () => {
  const form = useForm<Filter>({
    defaultValues,
  })
  const { control, handleSubmit } = form

  const { getApi } = useSubjectsMutation()

  const onClickFilter = handleSubmit((data) => {
    getApi.reload(data)
  })

  return (
    <>
      <div>
        <ControlledInputText
          label='filter name'
          placeholder='filter name'
          controllerProps={{ control, name: 'name' }}
        />
      </div>

      <Button onClick={onClickFilter}>filter response</Button>
    </>
  )
}
