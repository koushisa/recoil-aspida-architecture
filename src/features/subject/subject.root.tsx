import { Box, Checkbox } from '@chakra-ui/react'
import React from 'react'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'
import { AppSpinnerSuspense } from '@/components/SpinnerSuspense'
import {
  SubjectFilterForm,
  SubjectFilterFormProps,
} from '@/features/subject/subject.filter'
import { SubjectForm, SubjectFormProps } from '@/features/subject/subject.form'
import { SubjectFormFields } from '@/features/subject/subject.form.fields'
import { SubjectList } from '@/features/subject/subject.list'
import { aspida } from '@/lib/aspida'
import { atomWithAspida } from '@/lib/recoil/integrations/aspida/atomWithAspida'

export const subjectListQuery = atomWithAspida({
  entry({ get }) {
    return aspida.api.v1.subjects
  },
  option({ get }, currentOption) {
    return {
      query: currentOption.query,
    }
  },
})

export const SubjectRoot: React.FC = () => {
  const [isOptimistic, setIsOptimistic] = useState(false)

  const { getApi } = subjectListQuery.useMutation()
  const { postApi } = subjectListQuery.useMutation({
    onSuccess() {
      alert('post success')
    },
    onError(e) {
      alert('post error ')
      console.log({ e })
    },
  })

  const formProps: SubjectFormProps = {
    formProps: {
      defaultValues: { name: '', description: '', disabled: false },
    },
    onValid: (body) => {
      return postApi.call({
        body,
        refetchOnSuccess: true,
      })
    },
    onInValid: (err, evt) => {
      console.log({ err, evt })
    },
    Fields: (form) => <SubjectFormFields form={form} />,
  }

  const optimisticFormProps: SubjectFormProps = {
    ...formProps,

    // optimistic update
    onValid: (body) => {
      return postApi.call({
        body,
        refetchOnSuccess: false,
        rollbackOnError: true,
        optimisticData: (current) => {
          const optData = { ...body, id: current.length + 1 }
          return [...current, optData]
        },
      })
    },
  }

  const filterProps: SubjectFilterFormProps = {
    formProps: {},
    onValid: (body) => {
      return getApi.reload(body)
    },
  }

  const onItemDeleted = () => {
    return getApi.refetch()
  }

  return (
    <>
      <h2>form</h2>

      <Checkbox
        checked={isOptimistic}
        onChange={(_) => {
          setIsOptimistic(!isOptimistic)
        }}>
        optimistic
      </Checkbox>

      <Box padding={4}>
        {isOptimistic ? (
          <SubjectForm {...optimisticFormProps} />
        ) : (
          <SubjectForm {...formProps} />
        )}
      </Box>

      <Box padding={4}>
        <FormStatus formStatus={{ ...postApi }} />
      </Box>

      <h2>list</h2>
      <Box padding={4}>
        <SubjectFilterForm {...filterProps} />

        <AppSpinnerSuspense>
          <SubjectList onItemDeleted={onItemDeleted} />
        </AppSpinnerSuspense>
      </Box>
    </>
  )
}
