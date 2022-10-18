Proof of concept for [Recoil](https://github.com/facebookexperimental/Recoil) and [Aspida](https://github.com/aspida/aspida) integration that is managing (ServerState | cache) in data-flow-graph.

Zenn's Scrap: https://zenn.dev/link/comments/c762aa47242900

This architecture is opinionated, but intended to scalable 
- cache based state management
- feature sliced structure
- Render as you fetch pattern for asynchronious data

Sample code includes some features for explanation.

- Create, Read, Delete (Update is coming soon)
- Custom mutations that is defined in data-flow-graph
  - Optimistic Update
  - Automated Refetching
- Suspence based loading
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
  - Sometimes you want to have an abstraction on the data fetch layer
- implementation with tanstack query 
  - dir: https://github.com/koushisa/recoil-aspida-sample/tree/main/src/features/subject__anti
  - fmm... cache management seemed a bit redundant.
    - https://github.com/koushisa/recoil-aspida-sample/blob/main/src/features/subject__anti/anti.hooks.tsx
    - https://github.com/koushisa/recoil-aspida-sample/blob/9252a2d48dd8c4ff47d635eca78bcf2326769229/src/features/subject__anti/anti.item.tsx#L46-L52

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
usersQuery.mutation //  getCallback
usersQuery.useQuery 
usersQuery.useQueryLoadable
usersQuery.useMutation
---

const UsersList = () => {
  // almout same as: useRecoilValue(usersQuery.data)
  const users = usersQuery.useQuery()
  
  // almout same as: useRecoilValueValueLoadable(usersQuery.data)
  const users = usersQuery.useQueryLoadable()

  return (/*~*/)
}

const UserActions = () => {
  const { getApi, postApi, patchApi, ...etc } = usersQuery.useMutation()
  
  // abstraction of aspida.api.users.$get()
  const { prefetch, refetch, reload } = getApi

  getApi.prefetch()
  getApi.refetch()
  getApi.reload({ name: 'foo' }) // declarative api call. it will update `usersQuery.data`.
  const response = getApi.call({ name: 'foo' }) // imperative api call. it won't update state.

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

### Construct dependency 

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

- [Use query via hooks](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.list.tsx#L15-L16)
- [Filter sample](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.filter.tsx#L15-L25)
- [Polling](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/student/student.list.tsx#L24-L30)
- Derrived state
  - `data` is derivable in the same way as usual `RecoilState`
  ```tsx
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

- [Mutation sample](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.form.tsx#L20-L29)
- [Custom mutation sample](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/sandbox/sandbox.root.tsx#L23-L56)
- [Optimistic update sample](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.form.tsx#L52-L64)

### props-based api call

- `atomWithFamily`
  - [defs](https://github.com/koushisa/recoil-aspida-architecture/blob/c2712510df1c8ee534a682558874f6cab4210528/src/features/sandbox/sandbox.item.tsx#L9-L31)
  - [component](https://github.com/koushisa/recoil-aspida-architecture/blob/c2712510df1c8ee534a682558874f6cab4210528/src/features/sandbox/sandbox.item.tsx#L55-L58)
- `useAtomWithAspida `
  - [component](https://github.com/koushisa/recoil-aspida-architecture/blob/c2712510df1c8ee534a682558874f6cab4210528/src/features/subject/subject.item.tsx#L28-L43)

## Utility 

### atomWithAspida

- [src](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/lib/recoil/integrations/aspida/atomWithAspida.ts#L40)
- [component](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.root.tsx#L10-L19)

## `useAtomWithAspida`

- [src](https://github.com/koushisa/recoil-aspida-architecture/blob/c2712510df1c8ee534a682558874f6cab4210528/src/lib/recoil/integrations/aspida/atomWithAspida.ts#L300-L306)
- [component](https://github.com/koushisa/recoil-aspida-architecture/blob/c2712510df1c8ee534a682558874f6cab4210528/src/features/subject/subject.item.tsx#L28-L43)

### atomWithQuery

- [src](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/lib/recoil/integrations/query/atomWithQuery/atomWithQuery.ts#L32)
- [component](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/sandbox/sandbox.root.tsx#L18-L31)

### atomWithQueryFamily

- [src](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/lib/recoil/integrations/query/atomWithQuery/atomWithQuery.ts#L56)
- [component](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.item.tsx#L9-L24)
