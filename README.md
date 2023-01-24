Proof of concept for [Recoil](https://github.com/facebookexperimental/Recoil) and [Aspida](https://github.com/aspida/aspida) integration that is managing (ServerState | cache) in data-flow-graph.

Scraps for info
- https://zenn.dev/link/comments/c762aa47242900
- https://scrapbox.io/koushisa/atomWithAspida

This architecture is opinionated, but intended to scalable and safely. 
- cache based state management
- feature sliced structure
- Render as you fetch pattern for asynchronious data

Sample code includes some features.

- Create, Read, Delete (Update is coming soon)
- Custom mutations that is defined in data-flow-graph
  - Optimistic Update
  - Automated Refetching
- Suspense
- Skeleton screen
- Form is created by [react-hook-form](https://github.com/react-hook-form/react-hook-form)
  - wrapper: https://github.com/koushisa/recoil-aspida-sample/tree/main/src/components/Form/shared/BaseInput
- API server is mocked by [msw/data](https://github.com/mswjs/data)
  - wrapper: https://github.com/koushisa/recoil-aspida-sample/tree/main/src/mocks


https://user-images.githubusercontent.com/31304738/187138482-103484d3-e9ca-486c-b438-eb0961caab41.mp4

1. Clone Template

```
git clone https://github.com/koushisa/recoil-aspida-sample.git
```

2. Install Packages

```
yarn install
```

3. Start Project

```
yarn dev
```

## Motivation

- As the product grows, the GUI becomes more complex 
- in these cases.
  - application requires more business logic.
  - REST API + tanstack query lacks domain modeling in these cases.
  - tanstack query does not support URL persistence, etc.
  - sometimes you want to have an abstraction on the data fetch layer
- implementated with tanstack query 
  - https://github.com/koushisa/recoil-aspida-architecture/tree/main/src/features/subject__rq
  - i feel cache management seemed a bit redundant.

## Features

- Declaratively construct a dependency tree
- Encapsulate and less boilerplate the server state management code, cache
- Simple and type-safe API call like RPC

```tsx
const usersQuery = atomWithAspida({
  entry({ get }) {
    return aspida.api.users
  },
  option({ get }, currentOption) {
    return {
      query: currentOption.query,
    }
  },
})

---
usersQuery.data // atom 
usersQuery.mutation // selector (getCallback)
usersQuery.useQuery 
usersQuery.useQueryLoadable
usersQuery.useMutation
---

const UsersList = () => {
  // almout same as: useRecoilValue(usersQuery.data)
  const users = usersQuery.useQuery()
  
  // almout same as: useRecoilValueValueLoadable(usersQuery.data)
  const users = usersQuery.useQueryLoadable()
  
  // keep previous value while loading
  const users = usersQuery.useQueryLoadable({ keepPrevious: true})

  return (/*~*/)
}

const UserActions = () => {
  const { getApi, postApi, patchApi, ...etc } = usersQuery.useMutation()
  
  // abstraction of aspida.api.users.$get()
  const { waitForSettled, refetch, reload } = getApi

  // If `usersQuery.data` is suspended, wait until it is resolved.
  getApi.waitForSettled() 
  // refetch with current parameters.
  getApi.refetch() 
  // refetch with new parameter.
  getApi.reload({ name: 'foo' }) 
  // imperative api call. it won't update state.
  const response = getApi.call({ name: 'foo' })

  // abstraction of aspida.api.users.$post()
  const { error, pending, success } = postApi

  // call post
  postApi.call({
    body: { name: 'newName' },
    // automatically refetch
    refetchOnSuccess: true,

    // options for optimistic update
    // refetchOnSuccess: false,
    // rollbackOnError: true,
    // optimisticData(current) {
    //   return [...current, { ...data, id: current.length + 1 }]
    // },
  })
  }

// each endpoint from aspida entry has same interface
const { call, error, pending, success } = patchApi
```

## Recipes

You can access any Recoil nodes in atomWithAspida's callback.

### Dependant Fetching

```tsx
const usersQuery = atomWithAspida({
  // the `get` is `GetRecoilValue`
  entry({ get }) {
    const orgId = get(orgIdState)

    return aspida.api.v1.orgs._orgId(orgId).users
  },
  // same here.
  option({ get }, currentOption) {
    const user = get(loginUserState)
  
    return {
      query: { 
        admin: user.isAdmin,
        ...currentOption.query
      },
    }
  },
})
```

### Conditional Fetching

```tsx
const usersQuery = atomWithAspida({
  /*~*/
  disabled(opts, currentOption) {
    const disabled = opts.get(someConditionState)

    return disabled
  },
})
```

### Manages Server State

- [Use query via hooks](https://github.com/koushisa/recoil-aspida-architecture/blob/573f9d1ee7bf8f7fe1174ab8d5cce7c3e617ca55/src/features/subject/subject.list.tsx#L18-L19)
- [Filter sample](https://github.com/koushisa/recoil-aspida-architecture/blob/573f9d1ee7bf8f7fe1174ab8d5cce7c3e617ca55/src/features/subject/subject.root.tsx#L75-L77)
- [Polling](https://github.com/koushisa/recoil-aspida-architecture/blob/573f9d1ee7bf8f7fe1174ab8d5cce7c3e617ca55/src/features/student/student.list.tsx#L24-L30)
- Derrived state
  - `data` is derivable in the same way as usual `RecoilState`
  ```tsx
  import { keyBy} from "lodash" 
  import { createUsersDomainModel } ./ 'logics'
  
  export const usersQuery = atomWithAspida(/*~*/)
  
  
  // dictionary
  const usersById = selector({
    key: "users/byId",
    get: ({ get }) => keyBy(get(usersQuery.data), "id")
  }
  
  // domain Model
  const usersDomainModel = selector({
    key: "users/domainModel"
    get:({ get }) => createUsersDomainModel(get(usersQuery.data))
  })
  ```
- Map/Transform response with Loadable
  - `useQueryLoadable` returns [Recoil Loadable](https://recoiljs.org/docs/api-reference/core/Loadable/). just use `Loadable.map`.
  ```tsx
  export const usersQuery = atomWithAspida(/*~*/)
  
  /*~*/
  
  const users = usersQuery.useQueryLoadable().map(users => {
    return {
      data: users,
      count: users.length
    }
  }).getValue()
  
  // mapped
  users.data 
  users.count
  ```
  

### Mutation

- [Mutation sample](https://github.com/koushisa/recoil-aspida-architecture/blob/573f9d1ee7bf8f7fe1174ab8d5cce7c3e617ca55/src/features/subject/subject.root.tsx#L30-L49)
- [Optimistic update sample](https://github.com/koushisa/recoil-aspida-architecture/blob/573f9d1ee7bf8f7fe1174ab8d5cce7c3e617ca55/src/features/subject/subject.root.tsx#L59-L70)
- [Custom Mutation sample](https://github.com/koushisa/recoil-aspida-architecture/blob/573f9d1ee7bf8f7fe1174ab8d5cce7c3e617ca55/src/features/sandbox/sandbox.root.tsx#L23-L56)

### props-based api call

- `useAtomWithAspida`
  - [component](https://github.com/koushisa/recoil-aspida-architecture/blob/573f9d1ee7bf8f7fe1174ab8d5cce7c3e617ca55/src/features/subject/subject.item.tsx#L29-L42)
- `atomWithFamily`
  - [defs](https://github.com/koushisa/recoil-aspida-architecture/blob/573f9d1ee7bf8f7fe1174ab8d5cce7c3e617ca55/src/features/sandbox/sandbox.item.tsx#L9-L29)
  - [component](https://github.com/koushisa/recoil-aspida-architecture/blob/573f9d1ee7bf8f7fe1174ab8d5cce7c3e617ca55/src/features/sandbox/sandbox.item.tsx#L53-L56)


## Utilitiy 

All utilities is included in here: 

https://github.com/koushisa/recoil-aspida-architecture/tree/main/src/lib/recoil/integrations

