export default function Page({ children }) {
    return (
        <div className = 'page absolute w-full h-full p-8 z-0 animate__animated'>
            {children}
        </div>
    )
}