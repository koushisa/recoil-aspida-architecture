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
import { ErrorDump } from '@/components/ErrorDump/ErrorDump'
import { AppSpinner } from '@/components/Spinner/Spinner'
import { RQSubjectQuery } from '@/features/subject__rq/rq.hooks'
import { RQSubjectItem } from '@/features/subject__rq/rq.item'

type RQSubjectListProps = {
  onItemDeleted: () => void
}

export const RQSubjectList: React.FC<RQSubjectListProps> = ({
  onItemDeleted,
}) => {
  const { data = [], isLoading, error, refetch } = RQSubjectQuery.useList()

  if (isLoading) return <AppSpinner />
  if (error) return <ErrorDump error={error} />

  return (
    <>
      <Button onClick={() => refetch()}>refetch</Button>
      {data.map((sub) => (
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
                  <RQSubjectItem
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
