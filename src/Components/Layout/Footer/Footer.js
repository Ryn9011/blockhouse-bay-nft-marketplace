
export default function Footer() {
    return (
        <footer className="bg-black text-white text-xs">
            <div className="content-center md:px-10 ">       
                <div className="flex justify-center">                                    
                    <div className="text-center">                   
                        <div>Copyright &copy; {new Date().getFullYear()}</div>
                    </div>
                </div>               
            </div>
        </footer>
    )
}