import React, { createContext, useContext } from 'react'

const FormContext = createContext()

export function FormProvider(props) {
	const { value, children } = props
	return (
	   <FormContext.Provider value = { value }>
		    { children }
	   </FormContext.Provider>
	)
}

export function useFormContext() {
	return useContext(FormContext)
}