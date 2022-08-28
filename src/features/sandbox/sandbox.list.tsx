import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Badge,
  Box,
} from '@chakra-ui/react'
import React from 'react'
import type { Subject } from 'api/api/v1/subjects'
import { ErrorDump } from '@/components/ErrorDump/ErrorDump'
import { SandboxSubjectItem } from '@/features/sandbox/sandbox.item'
import { useSandboxSubjects } from '@/features/sandbox/sandbox.root'

export const SandboxSubjectList: React.FC = () => {
  const subjects = useSandboxSubjects({ keepPrevious: true })

  if (subjects.state === 'hasError') {
    return <ErrorDump error={subjects.errorMaybe()} />
  }

  return <List subjects={subjects.getValue()} />
}

const List: React.FC<{
  subjects: Subject[]
}> = ({ subjects }) => {
  return (
    <>
      {subjects.map((sub) => (
        <Accordion key={sub.id} allowToggle>
          <AccordionItem>
            {({ isExpanded }) => (
              <>
                <h2>
                  <AccordionButton>
                    <Box flex='1' textAlign='left'>
                      {sub.name}
                      {sub.disabled && (
                        <Badge colorScheme='red' ml={2}>
                          disabled
                        </Badge>
                      )}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>

                {isExpanded ? <SandboxSubjectItem subjectId={sub.id} /> : null}
              </>
            )}
          </AccordionItem>
        </Accordion>
      ))}
    </>
  )
}
