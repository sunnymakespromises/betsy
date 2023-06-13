import React, { createContext, useContext } from 'react'

const SettingsContext = createContext()

export function SettingsProvider(props) {
	const { value, children } = props
	return (
	   <SettingsContext.Provider value = { value }>
		    { children }
	   </SettingsContext.Provider>
	)
}

export function useSettingsContext() {
	return useContext(SettingsContext)
}