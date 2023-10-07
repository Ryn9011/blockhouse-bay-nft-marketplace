export default function Cover() {
    return (
        <div className="bg-[url(bgplain.jpg)] h-screen bg-cover bg-center overflow-hidden">
            <section className="text-white flex justify-center">
                <div className="flex-col ">
                    <div className="flex justify-center">
                        <div className="mt-96 scale-[0.65] brightness-125">
                            <img src="logoplain.png" alt="" />
                        </div>
                    </div>
                </div>
                
            </section>
        </div>
    )
}