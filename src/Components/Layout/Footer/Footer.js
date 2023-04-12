
export default function Footer() {
    return (
        <footer className="bg-black py-1 text-white text-xs">
            <div className="content-center md:px-10 xl:px-40">       
                <div className="flex justify-center">                                    
                    <div className="text-center">                   
                        <div>Coptyright &copy; {new Date().getFullYear()}</div>
                    </div>
                </div>               
            </div>
        </footer>
    )
}