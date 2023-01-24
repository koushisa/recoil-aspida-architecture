import {
  Box,
  BoxProps,
  SkeletonText,
  SkeletonTextProps,
} from '@chakra-ui/react'
import { Suspense } from 'react'

type InternalBoxProps = BoxProps & {
  height: NonNullable<BoxProps['height']>
}

type Props = {
  boxProps: InternalBoxProps
  skeletonTextProps?: SkeletonTextProps
  children: React.ReactNode
}

type SkeletonProps = Omit<Props, 'children'>

const Skeleton: React.FC<SkeletonProps> = ({ boxProps, skeletonTextProps }) => {
  return (
    <Box {...boxProps}>
      <SkeletonText {...skeletonTextProps} />
    </Box>
  )
}

const TextSuspense: React.FC<Props> = ({
  boxProps,
  skeletonTextProps,
  children,
}) => {
  return (
    <Suspense
      fallback={
        <Skeleton boxProps={boxProps} skeletonTextProps={skeletonTextProps} />
      }>
      {children}
    </Suspense>
  )
}

export { TextSuspense }
