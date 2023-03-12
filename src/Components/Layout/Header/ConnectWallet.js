import { providers, utils } from "ethers"
import WebBundlr from '@bundlr-network/client';
import { useState, useRef } from "react";
import BigNumber from 'bignumber.js'


export default function ConnectWallet() {
    const [bundlrInstance, setBundlrInstance] = useState()
    const [balance, setBalance] = useState()
    const bundlrRef = useRef()

    const [file, setFile] = useState()
    const [image, setImage] = useState()
    const [uri, setUri] = useState()
    const [amount, setAmount] = useState()

    const initialise = async () => {
        await window.ethereum.enable()
        const provider = new providers.Web3Provider(window.ethereum)
        await provider._ready()

        const bundlr = new WebBundlr("https://node1.bundlr.network", "matic", provider)
        await bundlr.ready()

        setBundlrInstance(bundlr)
        bundlrRef.current = bundlr
        fetchBalance()
    }

    const fetchBalance = async () => {
        const bal = await bundlrRef.current.getLoadedBalance()
        console.log('bal ', utils.formatEther(bal.toString()))
        setBalance(utils.formatEther(bal.toString()))
    }

    function onFileChange(e) {
        const file = e.target.files[0]
        if (file) {
            const image = URL.createObjectURL(file)
            setImage(image)
            let reader = new FileReader()
            reader.onload = function () {
                if (reader.result) {
                    setFile(Buffer.from(reader.result))
                }
            }
            reader.readAsArrayBuffer(file)
        }
    }

    async function uploadFile() {
        let tx = await bundlrInstance.uploader.upload(file, [{ name: "Content-Type", value: "image/png" }])
        console.log('tx: ', tx)
        setUri(`http://arweave.net/${tx.data.id}`)

    }

    async function fundWallet() {
        if (!amount) return
        const amountParsed = parseInput(amount)
        let response = await bundlrInstance.fund(amountParsed)
        console.log('Wallet funded: ', response)
        fetchBalance()
    }

    function parseInput(input) {
        const conv = new BigNumber(input).multipliedBy(bundlrInstance.currencyConfig.base[1])
        if (conv.isLessThan(1)) {
            console.log('error: value too small')
            return
        } else {
            return conv
        }
    }

    return (
        <>
            <button onClick={initialise} className="hidden lg:inline-block py-2 px-6 bg-blue-500 hover:bg-blue-600 text-sm text-white font-bold rounded-xl transition duration-200" href="#">
                Connect Wallet
            </button>
            {balance && <p>{balance}</p>}
            {
                !balance && <button onClick={initialise}>Initialize</button>
            }
            {
                balance && (
                    <div>
                        <h3>Balance: {balance}</h3>
                        <div style={{ padding: '20px 0px' }}>
                            <input onChange={e => setAmount(e.target.value)} />
                            <button onClick={fundWallet}>Fund Wallet</button>
                        </div>
                        <input
                            type="file"
                            onChange={onFileChange}
                        />
                        <button onClick={uploadFile}>Upload File</button>
                        {
                            image && <img src={image} style={{ width: '200px' }} />
                        }
                        {
                            uri && <a href={uri}>{uri}</a>
                        }
                    </div>
                )
            }
        </>
    )
}

