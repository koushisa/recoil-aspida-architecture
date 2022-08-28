import { ChakraProvider } from '@chakra-ui/react'
import { RecoilRoot } from 'recoil'
import { Root } from '@/components/Root'

function App() {
  return (
    <RecoilRoot>
      <ChakraProvider>
        <Root />
      </ChakraProvider>
    </RecoilRoot>
  )
}

export default App
