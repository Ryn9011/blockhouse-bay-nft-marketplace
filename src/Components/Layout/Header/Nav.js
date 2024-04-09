import { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import ConnectButton from './ConnectWallet';
const { ethers } = require('ethers');

export default function Nav() {

	useEffect(() => {	
		load()
	}, [])

	//assigning location variable
	const location = useLocation();

	//destructuring pathname from location
	const { pathname } = location;

	//Javascript split method to get the name of the path in array
	const splitLocation = pathname.split("/");

	// Burger menus
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

	const [showMenu, setShowMenu] = useState(false)
	return (
		<div className=' bg-black'>
			<nav className="relative px-4 py-4 flex justify-between items-center">
				<a className="text-md font-bold leading-none" href="/">
					{/* <svg className="h-10" alt="logo" viewBox="0 0 100 100">
						<path d="M100 34.2c-.4-2.6-3.3-4-5.3-5.3-3.6-2.4-7.1-4.7-10.7-7.1-8.5-5.7-17.1-11.4-25.6-17.1-2-1.3-4-2.7-6-4-1.4-1-3.3-1-4.8 0-5.7 3.8-11.5 7.7-17.2 11.5L5.2 29C3 30.4.1 31.8 0 34.8c-.1 3.3 0 6.7 0 10v16c0 2.9-.6 6.3 2.1 8.1 6.4 4.4 12.9 8.6 19.4 12.9 8 5.3 16 10.7 24 16 2.2 1.5 4.4 3.1 7.1 1.3 2.3-1.5 4.5-3 6.8-4.5 8.9-5.9 17.8-11.9 26.7-17.8l9.9-6.6c.6-.4 1.3-.8 1.9-1.3 1.4-1 2-2.4 2-4.1V37.3c.1-1.1.2-2.1.1-3.1 0-.1 0 .2 0 0zM54.3 12.3L88 34.8 73 44.9 54.3 32.4V12.3zm-8.6 0v20L27.1 44.8 12 34.8l33.7-22.5zM8.6 42.8L19.3 50 8.6 57.2V42.8zm37.1 44.9L12 65.2l15-10.1 18.6 12.5v20.1zM50 60.2L34.8 50 50 39.8 65.2 50 50 60.2zm4.3 27.5v-20l18.6-12.5 15 10.1-33.6 22.4zm37.1-30.5L80.7 50l10.8-7.2-.1 14.4z"></path>
					</svg> */}
					<div className='h-14 w-14  xl:h-20 xl:w-20'>
						<img
							className="object-contain brightness-150 mb-2 mt-1 pl-3"
							src="./../tokengif.gif"
							alt="Blockhouse Bay"
						></img>
					</div>
				</a>
				<div className="xl:hidden">
					<button className="navbar-burger flex items-center text-blue-400 p-3">
						<svg className="block h-8 w-8 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
							<title>Mobile menu</title>
							<path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
						</svg>
					</button>
				</div>
				<ul className="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 whitespace-nowrap xl:mx-auto xl:flex xl:items-center xl:w-auto xl:space-x-6">
					<li><a className={splitLocation[1] === "for-sale" ? "active text-xl hover:text-red-500" : "text-xl text-white hover:text-red-500"} href="/for-sale">For Sale</a></li>
					<li className="text-gray-300">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="w-4 h-4 current-fill" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
						</svg>
					</li>
					<li><a className={splitLocation[1] === "to-rent" ? "active text-xl hover:text-red-500" : "text-xl text-white hover:text-red-500"} href="/to-rent">To Rent</a></li>
					<li className="text-gray-300">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="w-4 h-4 current-fill" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
						</svg>
					</li>
					<li><a className={splitLocation[1] === "owned" ? "active text-xl hover:text-red-500" : "text-xl text-white hover:text-red-500"} href="/owned">My Properties</a></li>
					<li className="text-gray-300">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="w-4 h-4 current-fill" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
						</svg>
					</li>
					<li><a className={splitLocation[1] === "renting" ? "active text-xl hover:text-red-500" : "text-xl text-white hover:text-red-500"} href="/renting">My Renting</a></li>
					<li className="text-gray-300">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="w-4 h-4 current-fill" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
						</svg>
					</li>
					<li><a className={splitLocation[1] === "all-properties" ? "active text-xl hover:text-red-500" : "text-xl text-white hover:text-red-500"} href="/all-properties">All Properties</a></li>
					<li className="text-gray-300">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="w-4 h-4 current-fill" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
						</svg>
					</li>
					<li><a className={splitLocation[1] === "exclusive" ? "active text-xl hover:text-red-500" : "text-xl text-white hover:text-red-500"} href="/blockhouse-bay-gardens">Blockhouse Bay Gardens</a></li>
					<li className="text-gray-300">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="w-4 h-4 current-fill" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
						</svg>
					</li>
					<li><a className={splitLocation[1] === "about" ? "active text-xl hover:text-red-500" : "text-xl text-white hover:text-red-500"} href="/how-to-play">How to Play</a></li>
				</ul>
				<div className='hidden xl:block'>
					<ConnectButton />
				</div>				
			</nav>
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
								<a className={splitLocation[1] === "for-sale" ? "active block p-4  font-semibold hover:bg-blue-50 hover:text-blue-600 rounded" : "block p-4  font-semibold text-white hover:bg-blue-50 hover:text-blue-600 rounded"} href="/for-sale">For Sale</a>
							</li>
							<li className="mb-1">
								<a className={splitLocation[1] === "to-rent" ? "active block p-4  font-semibold hover:bg-blue-50 hover:text-blue-600 rounded" : "block p-4  font-semibold text-white hover:bg-blue-50 hover:text-blue-600 rounded"} href="/to-rent">To Rent</a>
							</li>
							<li className="mb-1">
								<a className={splitLocation[1] === "owned" ? "active block p-4  font-semibold hover:bg-blue-50 hover:text-blue-600 rounded" : "block p-4  font-semibold text-white hover:bg-blue-50 hover:text-blue-600 rounded"} href="/owned">My Properties</a>
							</li>
							<li className="mb-1">
								<a className={splitLocation[1] === "renting" ? "active block p-4  font-semibold hover:bg-blue-50 hover:text-blue-600 rounded" : "block p-4  font-semibold text-white hover:bg-blue-50 hover:text-blue-600 rounded"} href="/renting">My Renting</a>								
							</li>
							<li className="mb-1">
								<a className={splitLocation[1] === "all-properties" ? "active block p-4  font-semibold hover:bg-blue-50 hover:text-blue-600 rounded" : "block p-4 text-base font-semibold text-white hover:bg-blue-50 hover:text-blue-600 rounded"} href="/all-properties">All Properties</a>
							</li>
							<li className="mb-1">
								<a className={splitLocation[1] === "exclusive" ? "active block p-4  font-semibold hover:bg-blue-50 hover:text-blue-600 rounded" : "block p-4  font-semibold text-white hover:bg-blue-50 hover:text-blue-600 rounded"} href="/blockhouse-bay-gardens">Blockhouse Bay Gardens</a>
							</li>
							<li className="mb-1">
								<a className={splitLocation[1] === "about" ? "active block p-4  font-semibold hover:bg-blue-50 hover:text-blue-600 rounded" : "block p-4  font-semibold text-white hover:bg-blue-50 hover:text-blue-600 rounded"} href="/how-to-play">How to Play</a>
							</li>
						</ul>
					</div>
					<div className="mt-auto">
						<div className="pt-6 text-center">
							<ConnectButton />
						</div>
						{/* <p className="mt-4 text-xs text-center text-white">
							<span>Copyright © 2023</span>
						</p> */}
					</div>
				</nav>
			</div>
		</div>
)}
