import React, { createContext, useContext } from 'react'

const StoreContext = createContext()

export function StoreProvider(props) {
	const { value, children } = props
	return (
	   <StoreContext.Provider value = { value }>
		    { children }
	   </StoreContext.Provider>
	)
}

export function useStoreContext() {
	return useContext(StoreContext)
}