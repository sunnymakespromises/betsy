import React, { createContext, useContext } from 'react'

const DevContext = createContext()

export function DevProvider(props) {
	const { value, children } = props
	return (
	   <DevContext.Provider value = { value }>
		    { children }
	   </DevContext.Provider>
	)
}

export function useDevContext() {
	return useContext(DevContext)
}