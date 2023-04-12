import Footer from "../Footer/Footer"

export default function Cover() {

    return (
        <div className="lg:mb-8">
            <section className="grid grid-cols-1 lg:grid-cols-9 xl3:grid-cols-11 px-8 pl-0 lg:pl-0 lg:px-0 text-white">
                <div></div>
                <div className="lg:mt-0 grid grid-cols-12 lg:hidden relative mb-12 mt-6">
                    <div className="image-container drop-shadow-2xl col-span-12 absolute h-5/6 md:h-2/3 md:w-5/6 md:pt-12 right-9 md:right-5">
                        <img src="logo.png" className="h-2/6 rotate-away" />
                        <img src="col.png" className="rotate-away brightness-110" />                       
                        <div className="gradient-overlay2 md:h-5/6"></div>
                    </div>                  
                </div>
                <div className="col-span-3 pl-12 xl3:pr-4 xl3:pt-16 lg:pl-0 pr-2 lg:pr-16">
                    <div className="mt-8 lg:mt-32 xl3:mt-64 flex flex-col justify-center">
                        <div className="pb-6 lg:pb-12 xl3:pb-24 text-3xl lg:text-6xl xl3:text-8xl font-serif">Create Your Property Portfolio Today! </div>
                        <p className="text-lg lg:text-2xl xl3:text-3xl xl3:mb-12 mb-8">Earn $$$ from your tennants or rent a property to earn tokens to buy a property of your own!</p>
                        <a href="/about">
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-12 lg:py-6 w-full rounded-full mb-8 lg:mb-0">
                                Get Started
                            </button> 
                        </a>
                    </div>
                </div>
              
                <div className="lg:mt-4 xl3:mt-64 col-span-5 hidden lg:max-w-4xl xl3:max-w-6xl xl3:ml-24 lg:block">
                    <div className="image-container drop-shadow-2xl relative">
                        <img src="logo.png" className="scale-75 rotate-away p-12 pb-0" />
                        <img src="col.png" className="rotate-away brightness-110" />
                        {/* <img src="sidetoken.png" className="h-2/5 w-2/6 brightness-150 absolute bottom-0 right-0 transform translate-x-3/4 translate-y-full" /> */}
                        <div className="gradient-overlay"></div>
                    </div>
                </div>
            </section>                      
        </div>
    )
}
