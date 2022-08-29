PoC of [Recoil](https://github.com/facebookexperimental/Recoil) and [Aspida](https://github.com/aspida/aspida) integration that is managing (ServerState | cache) in atomic state tree.

Zenn's Scrap: https://zenn.dev/link/comments/c762aa47242900

This architecture intended to scalable with Render As Fetch Pattern and co-location based structure.

Sample code includes some features for explanation.

- Create, Read, Delete
- Suspence based loading
- Skeleton screen
- API server is mocked by [msw/data](https://github.com/mswjs/data)
  - mocks: https://github.com/koushisa/recoil-aspida-sample/tree/main/src/mocks


https://user-images.githubusercontent.com/31304738/187138482-103484d3-e9ca-486c-b438-eb0961caab41.mp4

1. Clone Template

```
git clone https://github.com/igdev116/vite-react-ts-eslint-prettier.git
```

2. Install Packages

```
yarn install
```

3. Start Project

```
yarn dev
```

## Features

- Declaratively construct a dependency tree
- Encapsulate the management of server state, cache
- Simple and type-safe API call like RPC


```tsx
export const {
  query: [subjectListState, useSubjects],
  mutation: [useSubjectsMutation],
} = atomWithAspida({
  // you can pass any aspida entry
  entry() {
    return aspida.api.v1.subjects
  },
  option(_, currentOption) {
    return {
      query: currentOption.query,
    }
  },
})

// Loadable<Subject[]>
const subjects = useSubjects()

const { getApi, postApi } = useSubjectsMutation()

// getApi is abstraction of aspida.api.v1.subjects.$get()
const { prefetch, refetch, reload } = getApi

getApi.prefetch()
getApi.refetch()
getApi.reload({ name: 'foo' }) // declarative api call. it will update the `subjectListState`.
const response = getApi.call({ name: 'foo' }) // imperative api call. it won't update state.

// postApi is abstraction of aspida.api.v1.subjects.$post()
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

// each endpoint from aspida entry has same interface
const { call, error, pending, success } = patchApi
```

## Recipes

You can access any Recoil nodes in atomWithAspida's callback.

### Construct dependency 

```tsx
export const {
  query: [userListState, useUsers],
  mutation: [useUsersMutation],
} = atomWithAspida({
 // the `get` is `GetRecoilValue`
 entry({ get }) {
    const tenantId = get(tenantIdState)

    return aspida.api.v1.tenant._tenantId(tenantId).users
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
export const {
  query: [userListState, useUsers],
  mutation: [useUsersMutation],
} = atomWithAspida({
  /*~*/
  disabled(opts, currentOption) {
    const disabled = opts.get(someConditionState)

    return disabled
  },
})
```

### Manages Server State

- [Use query via hooks](https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/subject/subject.list.tsx#L15-L16)
- [Filter sample](https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/subject/subject.filter.tsx#L15)
- [Polling](https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/student/student.list.tsx#L26-L30)
- derrived state
  - `atomWithAspida` returns [RecoilNode, Hooks] tuple. so it is derivable in the same way as usual.
  ```tsx
  export const {
    query: [userListState, useUsers],
    mutation: [useUsersMutation],
  } = atomWithAspida(/*~*/)

  const presentationModel = selector({
    key: "users/presentationModel"
    get:( {get} ) => createUsersPresentationModel(get(userListState))
  })
  ```

### Mutation

- [Mutation sample](https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/subject/subject.form.tsx#L39-L48)
- [Optimistic update sample](https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/subject/subject.form.tsx#L68-L95)

### props-based api call

- use atomWithFamily
  - [api](https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/subject/subject.item.tsx#L9-L27)
  - [component](https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/subject/subject.item.tsx#L51-L54)
- `atomWithAspidaFamily` will coming soon in this use cace
  - so, this [callDelete function](https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/subject/subject.item.tsx#L18-L24) won't need anymore.

## Utility 

### atomWithAspida

- interface: https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/subject/subject.root.tsx#L10-L13
- src: https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/lib/recoil/integrations/aspida/atomWithAspida.ts#L43

### atomWithQuery

- interface: https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/sandbox/sandbox.root.tsx#L18-L21
- src: https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/lib/recoil/integrations/query/atomWithQuery/atomWithQuery.ts#L27

### atomWithQueryFamily

- interface: https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/features/subject/subject.item.tsx#L9-L12
- src: https://github.com/koushisa/recoil-aspida-sample/blob/33b67c785dc9e9a4fd5ee570fbd408e7357d8d81/src/lib/recoil/integrations/query/atomWithQuery/atomWithQuery.ts#L54
