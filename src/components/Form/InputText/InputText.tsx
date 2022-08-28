import {
  FormLabel,
  FormControl,
  Input,
  Box,
  FormErrorMessage,
} from '@chakra-ui/react'
import type { BaseInputProps } from '@/components/Form/shared/BaseInput'

type Props = BaseInputProps<string>

export const InputText: React.FC<Props> = (props) => {
  const { id = useId(), label, placeholder, inputProps, error } = props

  return (
    <>
      <FormControl id={id} isInvalid={!!error}>
        <FormLabel htmlFor={id}>{label}</FormLabel>
        <Box>
          <Input type='text' {...inputProps} placeholder={placeholder} />
          {error !== undefined && (
            <FormErrorMessage>{error.message}</FormErrorMessage>
          )}
        </Box>
      </FormControl>
    </>
  )
}
