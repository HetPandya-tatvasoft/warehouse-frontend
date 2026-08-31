import { useState, type SetStateAction, type Dispatch } from "react";

/**
 * Maintains local state synchronized with an external value.
 * Resets the local state when the external value changes.
 *
 * @param externalValue - The external value/prop to synchronize with
 * @returns A stateful value and a function to update it, same as `useState`
 */
export function useSyncedState<T>(
  externalValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(externalValue);
  const [prevExternalValue, setPrevExternalValue] = useState<T>(externalValue);

  if (externalValue !== prevExternalValue) {
    setPrevExternalValue(externalValue);
    setState(externalValue);
  }

  return [state, setState];
}
