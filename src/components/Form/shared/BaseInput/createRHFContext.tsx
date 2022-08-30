import {
  FieldValues,
  FormProvider,
  useFormContext,
  UseFormProps,
  useForm as useReactHookForm,
} from 'react-hook-form'

export interface EnhancedProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any
> {
  formProps?: UseFormProps<TFieldValues, TContext>
  children?: React.ReactNode
}

/** React Hook Form Utility for React.Context*/
export const createRHFContext = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any
>() => {
  type ProviderProps = {
    formProps?: UseFormProps<TFieldValues, TContext>
    children?: React.ReactNode
  }

  const Provider: React.FC<ProviderProps> = ({ formProps, children }) => {
    const form = useReactHookForm(formProps)

    return <FormProvider {...form}>{children}</FormProvider>
  }

  const useForm = () => useFormContext<TFieldValues>()

  const withProvider = <OriginalProps extends {}>(
    WrappedComponent: React.ComponentType<OriginalProps>
  ) => {
    type ResultProps = OriginalProps & ProviderProps

    const hoc = (props: ResultProps) => {
      const { formProps } = props

      return (
        <Provider formProps={formProps}>
          <WrappedComponent {...props} />
        </Provider>
      )
    }

    return hoc
  }

  return [useForm, withProvider, Provider] as const
}
