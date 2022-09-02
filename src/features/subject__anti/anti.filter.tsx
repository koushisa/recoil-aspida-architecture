import { Button } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'
import {
  AntiSubjectFilterForm,
  useAntiSubjectFilterForm,
} from '@/features/subject__anti/anti.root'

const useReload = () => {
  const form = useAntiSubjectFilterForm()

  const reload = (filter: AntiSubjectFilterForm) => {
    form.reset(filter)
  }

  return reload
}

export const AntiSubjectFilter: React.FC = () => {
  const form = useForm({
    defaultValues: {
      name: '',
    },
  })

  const { control, handleSubmit } = form

  const reload = useReload()

  const onClickFilter = handleSubmit((data) => {
    reload(data)
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
