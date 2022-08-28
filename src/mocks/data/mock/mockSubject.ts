import { primaryKey } from '@mswjs/data'
import type { FactoryAPI } from '@mswjs/data/lib/glossary'
import type { Subject } from 'api/api/v1/subjects'

const dict = {
  subject: {
    id: primaryKey(Number),
    name: String,
    description: String,
    disabled: Boolean,
  },
}

export type SubjectModelDict = typeof dict
type DB = FactoryAPI<SubjectModelDict>

const seed = (db: DB) => {
  data.forEach(({ id, name, description, disabled }) => {
    db.subject.create({
      id,
      name,
      description,
      disabled,
    })
  })
}

const handler = (db: DB, baseUrl?: string) =>
  db.subject.toHandlers('rest', baseUrl)

const data: Subject[] = [
  {
    id: 1,
    name: 'national language',
    description:
      'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
    disabled: false,
  },
  {
    id: 2,
    name: 'english',
    description:
      'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
    disabled: false,
  },
  {
    id: 3,
    name: 'math',
    description:
      'et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut',
    disabled: true,
  },
  {
    id: 4,
    name: 'science',
    description:
      'ullam et saepe reiciendis voluptatem adipisci\nsit amet autem assumenda provident rerum culpa\nquis hic commodi nesciunt rem tenetur doloremque ipsam iure\nquis sunt voluptatem rerum illo velit',
    disabled: true,
  },
  {
    id: 5,
    name: 'society',
    description:
      'repudiandae veniam quaerat sunt sed\nalias aut fugiat sit autem sed est\nvoluptatem omnis possimus esse voluptatibus quis\nest aut tenetur dolor neque',
    disabled: false,
  },
]

export const MockSubject = {
  dict,
  data,
  seed,
  handler,
}
