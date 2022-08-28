import { primaryKey } from '@mswjs/data'
import type { FactoryAPI } from '@mswjs/data/lib/glossary'
import type { Student } from 'api/api/v1/students'

const dict = {
  student: {
    id: primaryKey(Number),
    name: String,
  },
}

export type StudentModelDict = typeof dict
type DB = FactoryAPI<StudentModelDict>

const seed = (db: DB) => {
  data.forEach(({ id, name }) => {
    db.student.create({
      id,
      name,
    })
  })
}

const handler = (db: DB, baseUrl?: string) =>
  db.student.toHandlers('rest', baseUrl)

const data: Student[] = [
  {
    id: 1,
    name: 'Hoge',
  },
  {
    id: 2,
    name: 'Foo',
  },
  {
    id: 3,
    name: 'Bar',
  },
]

export const MockStudent = {
  dict,
  data,
  seed,
  handler,
}
