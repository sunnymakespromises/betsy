import React, { createContext, useContext } from 'react'

const HomeContext = createContext()

export function HomeProvider(props) {
	const { value, children } = props
	return (
	   <HomeContext.Provider value = { value }>
		    { children }
	   </HomeContext.Provider>
	)
}

export function useHomeContext() {
	return useContext(HomeContext)
}