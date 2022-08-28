import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import { AppSpinnerSuspence } from '@/components/SpinnerSuspence'
// import { SandboxSubjectRoot } from '@/features/sandbox/sandbox.root'
// import { AntiSubjectRoot } from '@/features/subject__anti/anti.root'
import { StudentList } from '@/features/student/student.list'
import { SubjectRoot } from '@/features/subject/subject.root'

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
          {/* <SandboxSubjectRoot />
          <AntiSubjectRoot /> */}
        </TabPanel>
        <TabPanel>
          <h1>Students</h1>
          <AppSpinnerSuspence>
            <StudentList />
          </AppSpinnerSuspence>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
