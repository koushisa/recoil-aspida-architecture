import type { DefineMethods } from 'aspida'
import type { Subject } from "api/api/v1/subjects"

export type Methods = DefineMethods<{
  get: {
    resBody: Subject
  },

  put:{
    reqBody: Partial<Subject>
    resBody:Subject
  }

  delete: {
    reqBody: Partial<Subject>
    resBody: Subject
  }
}>
