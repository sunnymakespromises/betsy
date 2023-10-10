import React, { createContext, useContext } from 'react'

const SearchEventsContext = createContext()

export function SearchEventsProvider(props) {
	const { value, children } = props
	return (
	   <SearchEventsContext.Provider value = { value }>
		    { children }
	   </SearchEventsContext.Provider>
	)
}

export function useSearchEventsContext() {
	return useContext(SearchEventsContext)
}