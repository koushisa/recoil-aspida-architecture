import { get } from 'lodash'
import React, { useCallback, useMemo } from 'react'
import {
  FieldPath,
  FieldValues,
  useController,
  UseControllerProps,
  useFormState,
} from 'react-hook-form'

type RHFInputProps<T> = {
  name?: string
  value?: T
  onChange?: (...event: any[]) => void
  onBlur?: () => void
  ref?: (instance: any) => void
}

type RHFControllerFieldState = {
  isTouched?: boolean
  isDirty?: boolean
  error?:
    | {
        message: string
      }
    | undefined
}

type RHFAdapterProps<T> = RHFControllerFieldState & {
  inputProps?: RHFInputProps<T>
}

export type BaseInputProps<T> = RHFAdapterProps<T> & {
  id?: string
  label?: string
  placeholder?: string
}

export interface EnhancedProps<T = FieldValues> {
  controllerProps: UseControllerProps<T, FieldPath<T>>
}

export const withReactHookFormAdapter = <OriginalProps extends {}>(
  WrappedComponent: React.ComponentType<OriginalProps & EnhancedProps>
) => {
  type ResultProps<T> = OriginalProps & EnhancedProps<T>

  const hoc = <T extends FieldValues>(props: ResultProps<T>) => {
    const { controllerProps } = props

    const { field, fieldState } = useController(controllerProps)
    const { errors } = useFormState(controllerProps)

    const { value: controllerValue, onChange: controllerOnChange } = field
    const { value: parentValue, onChange: parentOnChange } = props as any
    const error: any = get(errors, controllerProps.name)

    const value = useMemo(
      () => parentValue ?? controllerValue,
      [controllerValue, parentValue]
    )

    const onChange: any = useCallback(
      (newValue: any) => {
        const fn = parentOnChange ?? controllerOnChange
        fn(newValue)
      },
      [controllerOnChange, parentOnChange]
    )

    const enhancedProps: RHFAdapterProps<any> = {
      ...props,
      ...fieldState,
      error,
      inputProps: {
        ...field,
        value,
        onChange,
      },
    }

    return <WrappedComponent {...(enhancedProps as any)} />
  }

  return hoc
}
