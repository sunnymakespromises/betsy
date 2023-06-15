import Conditional from "./conditional";

export default function Page({ dim = null, children }) {
    return (
        <div className = 'page absolute w-full h-full p-8 z-0 animate__animated'>
            <Conditional value = {dim}>
                <div className = 'absolute -top-[100%] -left-[100%] w-[9999px] h-[9999px] bg-base-0 opacity-70 pointer-events-none z-10'/>
            </Conditional>
            {children}
        </div>
    )
}