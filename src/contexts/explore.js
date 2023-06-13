import React, { createContext, useContext } from 'react'

const ExploreContext = createContext()

export function ExploreProvider(props) {
	const { value, children } = props
	return (
	   <ExploreContext.Provider value = { value }>
		    { children }
	   </ExploreContext.Provider>
	)
}

export function useExploreContext() {
	return useContext(ExploreContext)
}