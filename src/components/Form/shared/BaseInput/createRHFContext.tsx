import {
  FieldValues,
  FormProvider,
  useFormContext,
  UseFormProps,
  useForm as useReactHookForm,
} from 'react-hook-form'

/** React Hook Form Utility for React.Context*/
export const createRHFContext = <
  TFieldValues extends FieldValues,
  ExtendedProps extends {} = {},
  TContext = any
>(
  outerFormProps?: UseFormProps<TFieldValues, TContext>
) => {
  type FormProviderProps = {
    formProps?: UseFormProps<TFieldValues, TContext>
    children?: React.ReactNode
  }

  const Provider: React.FC<FormProviderProps> = ({
    formProps: innerFormProps,
    children,
  }) => {
    const form = useReactHookForm({ ...outerFormProps, ...innerFormProps })

    return <FormProvider {...form}>{children}</FormProvider>
  }

  const useForm = () => useFormContext<TFieldValues>()

  const withProvider = <OriginalProps extends {}>(
    WrappedComponent: React.ComponentType<OriginalProps>
  ) => {
    type ResultProps = OriginalProps & FormProviderProps & ExtendedProps

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
