import Header from '../Header/Header';
import { useLocation } from "react-router-dom";
import ConnectButton from '../Header/ConnectWallet';
import React, { useEffect, useState } from 'react'

export default function Cover() {
    const location = useLocation();
    const { pathname } = location;
    const [loading, setLoading] = useState(true);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const img = new Image();
        img.src = 'mainbg.jpg'; // The background image URL
        img.onload = () => {
            setBgImage(img.src); // Store the loaded image source
            setTimeout(() => {setLoading(false);}, 2000);
            
        };
    }, []);

    function load() {
        // open
        const burger = document.querySelectorAll('.navbar-burger');
        const menu = document.querySelectorAll('.navbar-menu');

        if (burger.length && menu.length) {
            for (var i = 0; i < burger.length; i++) {
                burger[i].addEventListener('click', function () {
                    for (var j = 0; j < menu.length; j++) {
                        menu[j].classList.toggle('hidden');
                    }
                });
            }
        }

        // close
        const close = document.querySelectorAll('.navbar-close');
        const backdrop = document.querySelectorAll('.navbar-backdrop');

        if (close.length) {
            for (var i = 0; i < close.length; i++) {
                close[i].addEventListener('click', function () {
                    for (var j = 0; j < menu.length; j++) {
                        menu[j].classList.toggle('hidden');
                    }
                });
            }
        }

        if (backdrop.length) {
            for (var i = 0; i < backdrop.length; i++) {
                backdrop[i].addEventListener('click', function () {
                    for (var j = 0; j < menu.length; j++) {
                        menu[j].classList.toggle('hidden');
                    }
                });
            }
        }
    };


    //Javascript split method to get the name of the path in array
    const splitLocation = pathname.split("/");

    if (loading) {
        return (
            <div class="relative flex justify-center items-center mt-96">
              
                <img src="tokengif.gif" className="rounded-full h-96 w-96 brightness-125" />
            </div>
        )
    }
    return (
        <div className="bg-cover bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }}>

            <div style={{ backgroundImage: "url('aboutreduced.png')" }} className="bg-right h-screen brightness-110 lg:hidden bg-cover bg-center">
                <Header />
                <section className="text-white justify-center">

                    <div className="flex justify-center mb-6 xl3:mb-10 md:mb-0">
                        <div className="scale-[0.85] xl3:mt-8 md:scale-[0.65] 3xl:scale-[0.65] brightness-125 mt-16">
                            <img src="logoplain.png" alt="" />
                        </div>
                    </div>
                    <div className="flex justify-center mb-6 xl3:mb-12 ">
                        <a href="/how-to-play" className="text-white bg-pink-900 border-pink-300 hover:text-white opacity-85 hover:bg-opacity-60 border-4 shadow-lg text-sm md:text-base 
                         font-semibold hover:no-underline
                           rounded py-2.5 px-4 md:py-3 md:px-6">Get Started</a>
                    </div>
                    {/* <div className="flex justify-center relative px-4 lg:px-0 lg:pb-12 xl3:pb-0">
                        <img src="test48.png" className=" lg:w-2/5" alt="" />
                    </div> */}
                </section>
            </div>
            <div
                className="hidden lg:block lg:h-screen bg-fit bg-no-repeat bg-center brightness-110" // Tailwind classes for height and background positioning
            // style={{ backgroundImage: "url('test48.png')" }} // Using inline style to set the background image
            >
                <div className='flex justify-between relative p-4'>

                    <div className='p-4'><ConnectButton /></div>Ï
                    <button className="navbar-burger flex items-center text-blue-400 p-3">
                        <svg className="block h-8 w-8 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <title>Mobile menu</title>
                            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                        </svg>
                    </button>
                </div>
                <div className="navbar-menu relative z-50 hidden">
                    <div className="navbar-backdrop fixed inset-0 bg-gray-800 opacity-75"></div>
                    <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-gray-900 border-r overflow-y-auto">
                        <button className="navbar-close flex justify-end">
                            <svg className="h-4 w-4 text-white cursor-pointer hover:text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <div className="flex mb-8">
                            <a className="mr-auto text-3xl font-bold leading-none" href="/">
                                <div className='flex justify-start'>
                                    <img
                                        className="object-contain scale-100 mb-2 mt-6"
                                        src="./logoplain.png"
                                        alt=""
                                    ></img>
                                </div>
                            </a>
                        </div>
                        <div>
                            <ul>
                                <li className="mb-1">
                                    <a className={splitLocation[1] === "for-sale" ? "active block p-4  font-semibold  hover:text-red-500 rounded" : "block p-4  font-semibold text-white  hover:text-red-500 rounded"} href="/for-sale">For Sale</a>
                                </li>
                                <li className="mb-1">
                                    <a className={splitLocation[1] === "to-rent" ? "active block p-4  font-semibold  hover:text-red-500 rounded" : "block p-4  font-semibold text-white  hover:text-red-500 rounded"} href="/to-rent">To Rent</a>
                                </li>
                                <li className="mb-1">
                                    <a className={splitLocation[1] === "owned" ? "active block p-4  font-semibold  hover:text-red-500 rounded" : "block p-4  font-semibold text-white  hover:text-red-500 rounded"} href="/owned">My Properties</a>
                                </li>
                                <li className="mb-1">
                                    <a className={splitLocation[1] === "renting" ? "active block p-4  font-semibold  hover:text-red-500 rounded" : "block p-4  font-semibold text-white  hover:text-red-500 rounded"} href="/renting">My Renting</a>
                                </li>
                                <li className="mb-1">
                                    <a className={splitLocation[1] === "all-properties" ? "active block p-4  font-semibold  hover:text-red-500 rounded" : "block p-4 text-base font-semibold text-white  hover:text-red-500 rounded"} href="/all-properties">All Properties</a>
                                </li>
                                <li className="mb-1">
                                    <a className={splitLocation[1] === "exclusive" ? "active block p-4  font-semibold  hover:text-red-500 rounded" : "block p-4  font-semibold text-white  hover:text-red-500 rounded"} href="/blockhouse-bay-gardens">Blockhouse Bay Gardens</a>
                                </li>
                                <li className="mb-1">
                                    <a className={splitLocation[1] === "about" ? "active block p-4  font-semibold  hover:text-red-500 rounded" : "block p-4  font-semibold text-white  hover:text-red-500 rounded"} href="/how-to-play">How to Play</a>
                                </li>
                            </ul>
                        </div>
                        <div className='flex justify-start pl-3'>
                            <div className="pt-6">
                                <ConnectButton />
                            </div>
                            {/* <p className="mt-4 text-xs text-center text-white">
							<span>Copyright © 2023</span>
						</p> */}
                        </div>
                    </nav>
                </div>

                <section className="text-white">
                    <div className="flex justify-center mb-6 xl3:mb-0 md:mb-0">
                        <div className="scale-[0.85] md:scale-[0.65] 2xl:scale-75 xl3:scale-100 brightness-125 mt-32 mb-16">
                            <img src="logoplain.png" alt="" />
                        </div>
                    </div>
                    <div className="flex justify-center mb-6 xl3:mb-12 ">
                        <a href="/how-to-play" className="text-white bg-red-500 border-red-300 hover:text-white opacity-85 hover:bg-opacity-60 text-base font-semibold hover:no-underline border-4 shadow-lg rounded py-3 px-6">Get Started</a>
                    </div>
                    {/* <div className="flex justify-center relative px-4 lg:px-0 lg:pb-12 xl3:pb-0">
                <img src="test48.png" className=" lg:w-3/5" alt="" />
            </div> */}

                </section>
            </div>
        </div>
    )
}