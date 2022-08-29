import { Button } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ControlledInputText } from '@/components/Form/InputText/ControlledInputText'
import { useSandboxSubjectsMutation } from '@/features/sandbox/sandbox.root'

type Filter = {
  name: string | undefined
}

const defaultValues: Filter = {
  name: '',
}

export const SandboxSubjectFilter: React.FC = () => {
  const form = useForm<Filter>({
    defaultValues,
  })
  const { control, handleSubmit } = form

  const { reload } = useSandboxSubjectsMutation()

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
