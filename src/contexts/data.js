import React, { createContext, useContext } from 'react'

const DataContext = createContext()

export function DataProvider(props) {
	const { value, children } = props
	return (
	   <DataContext.Provider value = { value }>
		    { children }
	   </DataContext.Provider>
	)
}

export function useDataContext() {
	return useContext(DataContext)
}