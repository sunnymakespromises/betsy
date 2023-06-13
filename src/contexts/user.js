import React, { createContext, useContext } from 'react'

const UserContext = createContext()

export function UserProvider(props) {
	const { value, children } = props
	return (
	   <UserContext.Provider value = { value }>
		    { children }
	   </UserContext.Provider>
	)
}

export function useUserContext() {
	return useContext(UserContext)
}