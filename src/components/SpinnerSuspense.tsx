import { Suspense } from 'react'
import { AppSpinner } from '@/components/Spinner/Spinner'

type Props = {
  children: React.ReactNode
}

export const AppSpinnerSuspense: React.FC<Props> = ({ children }) => {
  return <Suspense fallback={<AppSpinner />}>{children}</Suspense>
}
