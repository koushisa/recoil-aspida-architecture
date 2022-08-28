import { Checkbox, Input } from '@chakra-ui/react'
import { FormStatus } from '@/components/Form/FormStatus/FormStatus'

type Form = {
  name: string
  description: string
  disabled: boolean
}

type SubjectFormProps = {
  formStatus: FormStatus
  onCreate: (data: Form) => void
  onCreateOptimistic: (data: Form) => void
}

export const AntiSubjectForm: React.FC<SubjectFormProps> = ({
  formStatus,
  onCreate,
  onCreateOptimistic,
}) => {
  const handleCreate = () => {
    onCreate({
      name: 'test name',
      description: 'test desc',
      disabled: true,
    })
  }

  const handleCreateTemporary = () => {
    onCreateOptimistic({
      name: 'hoge',
      description: 'hoge',
      disabled: false,
    })
  }

  return (
    <div>
      <FormStatus formStatus={formStatus} />

      <Form
        handleCreate={handleCreate}
        handleCreateOptimistic={handleCreateTemporary}
      />
    </div>
  )
}

const Form: React.FC<{
  handleCreate: (data: Form) => void
  handleCreateOptimistic: (data: Form) => void
}> = (props) => {
  const { handleCreate, handleCreateOptimistic } = props

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [disabled, setDisabled] = useState(false)

  return (
    <form>
      <Input
        placeholder='name'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <Input
        placeholder='description'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <Checkbox
        checked={disabled}
        onChange={(e) => setDisabled(e.target.checked)}>
        disabled
      </Checkbox>
      <br />
      <button
        type='button'
        onClick={() => handleCreate({ name, description, disabled })}>
        CREATE
      </button>
      <br />
      <button type='button' onClick={() => handleCreateOptimistic}>
        CREATE Optimistic
      </button>
    </form>
  )
}
