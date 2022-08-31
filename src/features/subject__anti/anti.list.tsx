import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Badge,
  Box,
  Button,
} from '@chakra-ui/react'
import React from 'react'
import type { Subject } from 'api/api/v1/subjects'
import { ErrorDump } from '@/components/ErrorDump/ErrorDump'
import { AppSpinner } from '@/components/Spinner/Spinner'
import { AntiSubjectQuery } from '@/features/subject__anti/anti.hooks'
import { AntiSubjectItem } from '@/features/subject__anti/anti.item'

export const AntiSubjectList: React.FC = () => {
  const { data = [], isLoading, error, refetch } = AntiSubjectQuery.useList()

  if (isLoading) return <AppSpinner />
  if (error) return <ErrorDump error={error} />

  return (
    <>
      {/* refetchがuseQueryに紐付いている */}
      <Button onClick={() => refetch()}>refetch</Button>
      <List subjects={data} />
    </>
  )
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

                {isExpanded ? <AntiSubjectItem subjectId={sub.id} /> : null}
              </>
            )}
          </AccordionItem>
        </Accordion>
      ))}
    </>
  )
}
