import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Badge,
  Box,
} from '@chakra-ui/react'
import React from 'react'
import { ErrorDump } from '@/components/ErrorDump/ErrorDump'
import { SubjectItem } from '@/features/subject/subject.item'
import { subjectListQuery } from '@/features/subject/subject.root'

type SubjectListProps = {
  onItemDeleted: () => void
}

export const SubjectList: React.FC<SubjectListProps> = ({ onItemDeleted }) => {
  const subjects = subjectListQuery.useQueryLoadable({ keepPrevious: true })

  if (subjects.state === 'hasError') {
    return <ErrorDump error={subjects.errorMaybe()} />
  }

  return (
    <>
      {subjects.getValue().map((sub) => (
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

                {isExpanded ? (
                  <SubjectItem
                    subjectId={sub.id}
                    onItemDeleted={onItemDeleted}
                  />
                ) : null}
              </>
            )}
          </AccordionItem>
        </Accordion>
      ))}
    </>
  )
}
