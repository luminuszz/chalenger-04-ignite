import { useState } from 'react';

type StatePayload<T> = OldStateFunction<T> | Partial<T>;

type Return<T> = [state: T, setState: (payload: StatePayload<T>) => void];

type OldStateFunction<T> = (oldState: T) => Partial<T>;

export function useObjectState<InitialState>(
	initialState: InitialState
): Return<InitialState> {
	const [state, setStateReact] = useState<InitialState>(initialState);

	const setState = (payload: StatePayload<InitialState>) => {
		if (typeof payload === 'function') {
			const response = payload(state);

			return setStateReact((old) => ({ ...old, ...response }));
		}

		setStateReact((old) => ({ ...old, ...payload }));
	};

	return [state, setState];
}
