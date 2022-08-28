type Props = {
  error: unknown
}

export const ErrorDump: React.FC<Props> = ({ error }) => {
  return (
    <pre style={{ maxHeight: 100, overflow: 'auto' }}>
      {JSON.stringify(error, null, 2)}
    </pre>
  )
}
