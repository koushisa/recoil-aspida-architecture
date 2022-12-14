import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Box,
} from '@chakra-ui/react'
import React from 'react'
import { useResetRecoilState } from 'recoil'
import { aspida } from '@/lib/aspida'
import { atomWithAspida } from '@/lib/recoil/integrations/aspida/atomWithAspida'
import useInterval from '@/lib/useInterval'

const studentListQuery = atomWithAspida({
  entry({ get }) {
    return aspida.api.v1.students
  },
  option({ get }) {
    return {}
  },
})

export const StudentList: React.FC = () => {
  const students = studentListQuery
    .useQueryLoadable({ keepPrevious: false })
    .getValue()

  // refetch every second
  const reset = useResetRecoilState(studentListQuery.data)
  useInterval(reset, 1000, false)

  return (
    <>
      {students.map((student) => (
        <Accordion key={student.id} allowToggle>
          <AccordionItem>
            {({ isExpanded }) => (
              <>
                <h2>
                  <AccordionButton>
                    <Box flex='1' textAlign='left'>
                      {student.name}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>

                {isExpanded ? <>{student.id}</> : null}
              </>
            )}
          </AccordionItem>
        </Accordion>
      ))}
    </>
  )
}
