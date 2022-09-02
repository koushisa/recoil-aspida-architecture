import { createContext } from 'react'
import {
  FieldValues,
  UseFormProps,
  useForm as useReactHookForm,
  UseFormReturn,
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

  const Context = createContext<UseFormReturn<TFieldValues, TContext> | null>(
    null
  )

  const useForm = () => {
    const context = useContext(Context)

    if (!context) {
      throw new Error('require wrapped by FormProvider ')
    }

    return context
  }

  const Provider: React.FC<FormProviderProps> = ({
    formProps: innerFormProps,
    children,
  }) => {
    const form = useReactHookForm({ ...outerFormProps, ...innerFormProps })

    return <Context.Provider value={form}>{children}</Context.Provider>
  }

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
