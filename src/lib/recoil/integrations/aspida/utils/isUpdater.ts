type Updater<T> = (currVal: T) => T

export type SetterOrUpdater<T> = T | ((currVal: T) => T)

export function isUpdater<T>(x: SetterOrUpdater<T>): x is Updater<T> {
  return typeof x === 'function'
}
