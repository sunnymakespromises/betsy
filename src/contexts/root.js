import React, { createContext, useContext } from 'react'

const RootContext = createContext()

export function RootProvider(props) {
	const { value, children } = props
	return (
	   <RootContext.Provider value = { value }>
		    { children }
	   </RootContext.Provider>
	)
}

export function useRootContext() {
	return useContext(RootContext)
}