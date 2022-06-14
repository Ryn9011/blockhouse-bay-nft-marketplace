import Logo from './Logo'
import Nav from './Nav'
import ConnectWallet from './ConnectWallet'

export default function Header() {
    return (
        <header className="text-white">
            {/* <div className="flex justify-between items-center p-6"> */}
                {/* <div className="">
                    <Logo />
                </div> */}
                <div>
                    <Nav />
                </div>   
                {/* <div className="">
                    <ConnectWallet />
                </div>              */}
            {/* </div>             */}
        </header>
    )
}