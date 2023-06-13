import React, { createContext, useContext } from 'react'

const WindowContext = createContext()

export function WindowProvider(props) {
	const { value, children } = props
	return (
	   <WindowContext.Provider value = { value }>
		    { children }
	   </WindowContext.Provider>
	)
}

export function useWindowContext() {
	return useContext(WindowContext)
}