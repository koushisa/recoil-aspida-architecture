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
- derrived state
  - data is `RecoilState`. so it is derivable in the same way as usual.
  ```tsx
  export const usersQuery = atomWithAspida(/*~*/)

  const presentationModel = selector({
    key: "users/presentationModel"
    get:( {get} ) => createUsersPresentationModel(get(usersQuery.data))
  })
  ```

### Mutation

- [Mutation sample](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.form.tsx#L20-L29)
- [Custom mutation sample](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/sandbox/sandbox.root.tsx#L23-L56)
- [Optimistic update sample](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.form.tsx#L52-L64)

### props-based api call

- use atomWithFamily
  - [api](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.item.tsx#L9-L24)
  - [component](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.item.tsx#L48-L51)
- `atomWithAspidaFamily` is coming soon in this use cace
  - so, this [callDelete function](https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.item.tsx#L15-L21) won't need anymore.

## Utility 

### atomWithAspida

- component: https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.root.tsx#L10-L19
- src: https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/lib/recoil/integrations/aspida/atomWithAspida.ts#L40

### atomWithQuery

- component: https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/sandbox/sandbox.root.tsx#L18-L31
- src: https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/lib/recoil/integrations/query/atomWithQuery/atomWithQuery.ts#L32

### atomWithQueryFamily

- component: https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/features/subject/subject.item.tsx#L9-L24
- src: https://github.com/koushisa/recoil-aspida-sample/blob/1f3f5a97d0a1b6c03797717c48eeef3386b46ae8/src/lib/recoil/integrations/query/atomWithQuery/atomWithQuery.ts#L56
