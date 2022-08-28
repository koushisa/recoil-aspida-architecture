import type { DefineMethods } from 'aspida'

export type Subject = {
  id: number
  name: string
  description: string
  disabled: boolean
}

export type Methods = DefineMethods<{
  get: {
    query?: {
      disabled?: number
    }

    resBody: Subject[]
  },

  post: {
    reqBody: Omit<Subject, "id">
    resBody: Subject
  }
}>
