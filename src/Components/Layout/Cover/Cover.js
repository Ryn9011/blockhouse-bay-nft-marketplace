export default function Cover() {
    return (
        <div className="bg-black lg:h-screen">
            <section className="text-white justify-center">
                <div className="flex justify-center mb-6 xl3:mb-10 md:mb-0">
                    <div className="scale-[0.85] xl3:mt-8 md:scale-[0.65] 3xl:scale-[0.65] brightness-125 ">
                        <img src="logoplain.png" alt="" />
                    </div>
                </div>
                <div className="flex justify-center mb-6 xl3:mb-12 ">
                    <a href="/about" className="mb-4 bg-green-600 px-6 py-2 rounded-full text-sm md:text-xl font-semibold">Get Started</a>
                </div>                
                <div className="flex justify-center relative px-4 lg:px-0 lg:pb-12 xl3:pb-0">
                    <img src="test48.png" className=" lg:w-2/5" alt="" />
                </div>
            </section>
        </div>
    )
}