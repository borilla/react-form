import React from 'react';

// TODO: Make into a proper class?
function FormContextValue() {
	const _valueGetters = new Map();
	const _eventListeners = new Map();

	function getValue() {
		const result = {};
		_valueGetters.forEach((getValue, name) => {
			result[name] = getValue();
		});
		return result;
	}

	function triggerEvent(eventName) {
		getEventListeners(eventName).forEach(listener => {
			listener(self, listener);
		});
	}

	function addNewEventType(eventName) {
		const listeners = new Set();
		_eventListeners.set(eventName, listeners);
		return listeners;
	}

	function getEventListeners(eventName) {
		return _eventListeners.get(eventName) || addNewEventType(eventName);
	}

	const self = {
		registerFormValue: (name, getValue) => { name && getValue && _valueGetters.set(name, getValue) },
		unregisterFormValue: (name, getValue) => { name && getValue && _valueGetters.delete(name) },
		addEventListener: (eventName, listener) => { listener && getEventListeners(eventName).add(listener) },
		removeEventListener: (eventName, listener) => { listener && getEventListeners(eventName).delete(listener) },
		getValue,
		triggerEvent
	};

	return self;
}

export const FormContext = React.createContext(new FormContextValue());

export function useFormComponentContext({ name, getValue } = {}) {
	const context = React.useContext(FormContext);

	React.useEffect(() => {
		context.registerFormValue(name, getValue);

		return () => {
			context.unregisterFormValue(name, getValue);
		}
	});

	return context;
}

export function useFormContainerContext({ name, onChange, onSubmit }) {
	const myContext = new FormContextValue();
	const parentContext = useFormComponentContext({ name, getValue: myContext.getValue });

	React.useEffect(() => {
		myContext.addEventListener('change', onChange);
		myContext.addEventListener('submit', onSubmit);

		return () => {
			myContext.removeEventListener('change', onChange);
			myContext.removeEventListener('submit', onSubmit);
		}
	});

	return myContext;
}
