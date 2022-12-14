import { rest, setupWorker } from 'msw'
import type { Subject } from 'api/api/v1/subjects'
import { HOST } from '@/lib/http'
import { mswDb, mswSeed } from '@/mocks/data/db'
import { mswMocks } from '@/mocks/data/mock'

const BASE_API_URL = `${HOST}/api/v1`

mswSeed()

const mockRestHandlers = mswMocks
  .map((mock) => mock.handler(mswDb, `${BASE_API_URL}/`))
  .flat(1)

export const worker = setupWorker(...(mockRestHandlers as any))

const handlers = [
  rest.get<Subject[]>(`${BASE_API_URL}/subjects`, async (req, res, ctx) => {
    if (Math.random() < 0.1) {
      return res(ctx.status(500), ctx.json({ status: 'error' }))
    }

    const name = req.url.searchParams.get('name')

    const subs = mswDb.subject.findMany({
      where: {
        name:
          name !== null
            ? {
                contains: name,
              }
            : undefined,
      },
    })

    return res(ctx.status(200), ctx.json(subs))
  }),

  rest.post<Subject>(`${BASE_API_URL}/subjects`, async (req, res, ctx) => {
    if (Math.random() < 0.3) {
      return res(ctx.status(500), ctx.json({ status: 'error' }))
    }

    const newSub = mswDb.subject.create({
      ...req.body,
      id: mswDb.subject.count() + 1,
    })

    return res(ctx.status(200), ctx.json(newSub))
  }),
]

worker.use(...handlers)
