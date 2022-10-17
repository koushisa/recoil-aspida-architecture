import {
  type ReadOnlySelectorOptions,
  selector as recoilSelector,
  useRecoilValueLoadable,
  Loadable,
} from 'recoil'

let uniqueIdForUseRecoilSelectorLoadable = 1

type Arg<T> = (
  selection: Parameters<ReadOnlySelectorOptions<unknown>['get']>[0]
) => T

export function useRecoilSelectorLoadable<T>(selection: Arg<T>): Loadable<T> {
  const selectionFnRef = useRef(selection)

  const memoizedSelector = useMemo(
    () =>
      recoilSelector({
        key: `useRecoilSelectorLoadable${uniqueIdForUseRecoilSelectorLoadable++}`,
        get: (opts) => selectionFnRef.current(opts),
      }),
    []
  )

  const data = useRecoilValueLoadable(memoizedSelector)

  useEffect(() => {
    return () => {
      uniqueIdForUseRecoilSelectorLoadable -= 1
    }
  }, [])

  return data
}
