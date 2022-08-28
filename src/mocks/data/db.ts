import { factory } from '@mswjs/data'
import type { StudentModelDict } from '@/mocks/data/mock/mockStudent'
import type { SubjectModelDict } from '@/mocks/data/mock/mockSubject'
import type { FactoryAPI } from '@mswjs/data/lib/glossary'
import { mswMocks } from '@/mocks/data/mock'

type MswModelDict = SubjectModelDict & StudentModelDict

// merge model dictionary
const dict = mswMocks.reduce((acc, mock) => {
  return {
    ...acc,
    ...mock.dict,
  }
}, {}) as MswModelDict

export const mswDb: FactoryAPI<MswModelDict> = factory(dict)

export const mswSeed = () => {
  mswMocks.forEach((mock) => mock.seed(mswDb as any))
}
