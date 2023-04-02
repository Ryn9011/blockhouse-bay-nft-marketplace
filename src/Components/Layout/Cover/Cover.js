export default function Cover() {

    return (
        <div className=" mb-8">
            <section className="grid grid-cols-1 lg:grid-cols-7 xl3:grid-cols-6 px-8 pl-0 lg:pl-8 lg:px-0 text-white">
                <div></div>
                <div className="col-span-2 pl-8 lg:pl-0">
                    <div className="mt-8 lg:mt-32 xl3:mt-64 flex flex-col justify-center">
                        <div className="pb-6 lg:pb-12 text-4xl lg:text-7xl xl3:text-8xl font-serif">Create Your Property Portfolio Today!</div>
                        <p className="text-xl mb-8">Earn $$$ from your tennants or rent a property to earn tokens to buy a property of your own!</p>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-12 lg:py-6 lg:px-32 rounded-full mb-8 lg:mb-0">
                            Get Started
                        </button>
                    </div>
                </div>
                <div className="lg:mt-24 xl3:mt-80 grid grid-cols-12 lg:hidden pr-12">
                    <div className="image-container drop-shadow-2xl relative col-span-12">
                        <img src="logo.png" className="h-2/6 rotate-away" />
                        <img src="col.png" className="rotate-away" />                       
                        <div className="gradient-overlay2"></div>
                    </div>                  
                </div>
                <div className="lg:mt-24 xl3:mt-80 col-span-3 hidden lg:block">
                    <div className="image-container drop-shadow-2xl relative">
                        <img src="logo.png" className="scale-50 rotate-away" />
                        <img src="col.png" className="rotate-away" />
                        <img src="sidetoken.png" className="h-2/5 w-2/6 brightness-150 absolute bottom-0 right-0 transform translate-x-3/4 translate-y-full" />
                        <div className="gradient-overlay"></div>
                    </div>
                </div>
            </section>
        </div>
    )
}


{/* <div className="lg:flex w-2/5 xl3:w-3/6 h-1/5 hidden lg:inline-block relative">
<img className=" object-cover rotate-12 transform translate-x-10 translate-y-10" src="house1.jpeg" alt="House 1" />
<img className=" object-cover transform -translate-x-20 translate-y-20" src="house2.jpeg" alt="House 2" />
<img className=" object-cover rotate-12 transform -translate-x-60 translate-y-30" src="house3.jpeg" alt="House 3" />
<img className="object-cover rotate-6 transform -translate-x-80 translate-y-20" src="house4.jpeg" alt="House 4" />
</div> */}