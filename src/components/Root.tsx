import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import { AppSpinnerSuspense } from '@/components/SpinnerSuspense'
import { StudentList } from '@/features/student/student.list'
import { SubjectRoot } from '@/features/subject/subject.root'
// import { RQSubjectRoot } from '@/features/subject__rq/rq.root'

export const Root = () => {
  return (
    <Tabs isLazy>
      <TabList>
        <Tab>Subjects</Tab>
        <Tab>Studunts</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <h1>Subjects</h1>
          <SubjectRoot />
          {/* <RQSubjectRoot /> */}
        </TabPanel>
        <TabPanel>
          <h1>Students</h1>
          <AppSpinnerSuspense>
            <StudentList />
          </AppSpinnerSuspense>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
