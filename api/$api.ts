import type { AspidaClient } from 'aspida'
import { dataToURLString } from 'aspida'
import type { Methods as Methods0 } from './api/v1/students'
import type { Methods as Methods1 } from './api/v1/subjects'
import type { Methods as Methods2 } from './api/v1/subjects/_subjectId@number'

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/api/v1/students'
  const PATH1 = '/api/v1/subjects'
  const GET = 'GET'
  const POST = 'POST'
  const PUT = 'PUT'
  const DELETE = 'DELETE'

  return {
    api: {
      v1: {
        students: {
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods0['get']['resBody']>(prefix, PATH0, GET, option).json(),
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods0['get']['resBody']>(prefix, PATH0, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH0}`
        },
        subjects: {
          _subjectId: (val3: number) => {
            const prefix3 = `${PATH1}/${val3}`

            return {
              get: (option?: { config?: T | undefined } | undefined) =>
                fetch<Methods2['get']['resBody']>(prefix, prefix3, GET, option).json(),
              $get: (option?: { config?: T | undefined } | undefined) =>
                fetch<Methods2['get']['resBody']>(prefix, prefix3, GET, option).json().then(r => r.body),
              put: (option: { body: Methods2['put']['reqBody'], config?: T | undefined }) =>
                fetch<Methods2['put']['resBody']>(prefix, prefix3, PUT, option).json(),
              $put: (option: { body: Methods2['put']['reqBody'], config?: T | undefined }) =>
                fetch<Methods2['put']['resBody']>(prefix, prefix3, PUT, option).json().then(r => r.body),
              delete: (option: { body: Methods2['delete']['reqBody'], config?: T | undefined }) =>
                fetch<Methods2['delete']['resBody']>(prefix, prefix3, DELETE, option).json(),
              $delete: (option: { body: Methods2['delete']['reqBody'], config?: T | undefined }) =>
                fetch<Methods2['delete']['resBody']>(prefix, prefix3, DELETE, option).json().then(r => r.body),
              $path: () => `${prefix}${prefix3}`
            }
          },
          get: (option?: { query?: Methods1['get']['query'] | undefined, config?: T | undefined } | undefined) =>
            fetch<Methods1['get']['resBody']>(prefix, PATH1, GET, option).json(),
          $get: (option?: { query?: Methods1['get']['query'] | undefined, config?: T | undefined } | undefined) =>
            fetch<Methods1['get']['resBody']>(prefix, PATH1, GET, option).json().then(r => r.body),
          post: (option: { body: Methods1['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods1['post']['resBody']>(prefix, PATH1, POST, option).json(),
          $post: (option: { body: Methods1['post']['reqBody'], config?: T | undefined }) =>
            fetch<Methods1['post']['resBody']>(prefix, PATH1, POST, option).json().then(r => r.body),
          $path: (option?: { method?: 'get' | undefined; query: Methods1['get']['query'] } | undefined) =>
            `${prefix}${PATH1}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
        }
      }
    }
  }
}

export type ApiInstance = ReturnType<typeof api>
export default api
