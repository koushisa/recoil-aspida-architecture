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
import { SubjectItem } from '@/features/subject/subject.item'

type Props = {
  subjects: Subject[]
}

export const AntiSubjectList: React.FC<Props> = ({ subjects }) => {
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

                {isExpanded ? <SubjectItem subjectId={sub.id} /> : null}
              </>
            )}
          </AccordionItem>
        </Accordion>
      ))}
    </>
  )
}
