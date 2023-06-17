export default function Page({ dim = null, children }) {
    return (
        <div className = 'page absolute w-full h-full p-8 z-0 overflow-hidden animate__animated'>
            <div id = 'dimmer' className = {'transition-all duration-main absolute -top-[100%] -left-[100%] w-[9999px] h-[9999px] bg-base-0 ' + (dim ? 'opacity-80' : 'opacity-0') + ' pointer-events-none z-10'}/>
            {children}
        </div>
    )
}