import React, { createContext, useContext } from 'react'

const ProfileContext = createContext()

export function ProfileProvider(props) {
	const { value, children } = props
	return (
	   <ProfileContext.Provider value = { value }>
		    { children }
	   </ProfileContext.Provider>
	)
}

export function useProfileContext() {
	return useContext(ProfileContext)
}