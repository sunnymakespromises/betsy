import React, { createContext, useContext } from 'react'

const UsersContext = createContext()

export function UsersProvider(props) {
	const { value, children } = props
	return (
	   <UsersContext.Provider value = { value }>
		    { children }
	   </UsersContext.Provider>
	)
}

export function useUsersContext() {
	return useContext(UsersContext)
}