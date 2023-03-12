export default function Cover() {

    return (
        <div className=" mb-8">
            <section className="grid grid-cols-1 lg:grid-cols-2 text-white">
                <div className="ml-0 lg:ml-4 xl:max-w-[40rem] 2xl:max-w-[50rem] xl3:max-w-[55rem]">                 
                    <img className="px-12 lg-px-0 pt-4 lg:pt-10 lg:ml-24 scale-60 h-1/4" src="logo.png" />
                    <div className="flex justify-center lg:ml-64 lg:mt-4 mb-6">
                        <button type="button" className="w-32 mt-2 text-gray-900 bg-green-400 focus:ring-4 border-indigo-600 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-xl text-sm px-5 py-2.5 text-center mr-2 mb-2">
                            <a href="/about">Get Started</a>
                        </button>
                    </div>
                    <p className="ml-6 tdx xs2:ml-8 xl:text-4xl font-semibold text-xl lg:ml-20 2xl:ml-48 xl3:ml-64 lg:mt-12">
                        Create your property portfolio today!
                    </p>
                    <div className="pl-8 mt-8 lg:ml-12">                        
                        <p className="pt-4 mr-6 text-xl lg:mb-24 2xl:ml-44">Earn $$$ from your tennants or rent a property to earn tokens to buy a property of your own!</p>
                        <div className="lg:flex w-2/5 h-1/5 hidden lg:inline-block relative">
                            <img className=" object-cover rotate-12 transform translate-x-10 translate-y-10" src="house1.jpeg" alt="House 1" />
                            <img className=" object-cover transform -translate-x-20 translate-y-20" src="house2.jpeg" alt="House 2" />
                            <img className=" object-cover rotate-12 transform -translate-x-60 translate-y-30" src="house3.jpeg" alt="House 3" />
                            <img className="object-cover rotate-6 transform -translate-x-80 translate-y-20" src="house4.jpeg" alt="House 4" />
                        </div>
                    </div>
                </div>
                      
                <div className="flex justify-center relative mb-6 lg:mt-32">
                    <img
                        src="main2.png"
                        alt="Image 1"
                        className="rotate-3 lg:max-w-[30rem] lg:max-h-[40rem] xl:max-h-[30rem] xl:max-w-[30rem] 2xl:max-w-[37rem] 2xl:max-h-[37rem] xl3:max-h-[60rem] xl3:max-w-[60rem]"
                    />
                </div>                               
            </section>
        </div>
    )
}


{/* <img
    src="main2.png"
    alt="Image 1"
    className="
        transform                         
        rotate-3 
        w-4/5 
        h-5/5 
        absolute               
        mb-0 
        lg:mt-4
        md:mt-0
        mr-4
        lg:mr-16"
/> */}