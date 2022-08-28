/* eslint-disable react-hooks/rules-of-hooks */
import {
  CallbackInterface,
  RecoilValueReadOnly,
  selectorFamily,
  SerializableParam,
  UnwrapRecoilValue,
  useRecoilValue,
} from 'recoil'
import { nanoid } from '@/lib/nanoid'

type Callback = (...args: ReadonlyArray<any>) => void

export type CallbackAtomInput<Func = Callback> = Record<
  string,
  (cb: CallbackInterface) => Func
>

export type CallbackAtomSelector<Obj extends CallbackAtomInput> =
  RecoilValueReadOnly<{
    [P in keyof Obj]: ReturnType<Obj[P]>
  }>

export type CallbackAtomResult<Obj extends CallbackAtomInput> = [
  CallbackAtomSelector<Obj>,
  () => UnwrapRecoilValue<CallbackAtomSelector<Obj>>
]

export type CallbackAtomFamilyResult<
  Obj extends CallbackAtomInput,
  P extends SerializableParam
> = [
  (param: P) => CallbackAtomSelector<Obj>,
  (param: P) => UnwrapRecoilValue<CallbackAtomSelector<Obj>>
]

export const callbackAtomFamily = <
  Obj extends CallbackAtomInput,
  P extends SerializableParam
>(
  inputs: (param: P) => Obj
): CallbackAtomFamilyResult<Obj, P> => {
  const result = selectorFamily({
    key: nanoid(),
    get:
      (param: P) =>
      ({ getCallback }) => {
        const callbackObj = inputs(param)
        const keys = Object.keys(callbackObj)

        const callbacks: any = {}

        keys.forEach((key) => {
          const callback = getCallback(
            (cb) =>
              (...args: ReadonlyArray<any>) => {
                const func = callbackObj[key]

                if (func === undefined) {
                  throw new Error(`callbackAtom: ${key} is not defined`)
                }

                cb.snapshot.retain()

                func({ ...cb, snapshot: cb.snapshot })(...args)
              }
          )

          callbacks[key] = callback
        })

        return callbacks
      },
  })

  const hooks = (param: P) => useRecoilValue(result(param))

  return [result, hooks]
}

export const callbackAtom = <Obj extends CallbackAtomInput>(
  input: Obj
): CallbackAtomResult<Obj> => {
  const key = nanoid()

  const [baseMutation, useBaseMutation] = callbackAtomFamily(() => {
    return input
  })

  const mutation = baseMutation(key)

  const useMutation = () => useBaseMutation(key)

  return [mutation, useMutation]
}
