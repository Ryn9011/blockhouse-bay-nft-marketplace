import React from 'react';

import {
    propertytokenaddress
  } from '../config'

class AddTokenButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tokenAdded: false
        };
        this.handleAddToken = this.handleAddToken.bind(this);
    }

    async handleAddToken() {
        const tokenAddress = propertytokenaddress;
        const tokenSymbol = "BHB";
        const tokenDecimals = 18;
        const tokenImage = "http://placekitten.com/200/300";

        try {
            const wasAdded = await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                        image: tokenImage                        
                    },
                },
            });

            this.setState({ tokenAdded: wasAdded });
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        return (
            <div>
                <button className='text-pink-400 hover:bg-pink-900 text-base border border-pink-400 rounded py-1 px-2' onClick={this.handleAddToken}>Add BHB Token</button>
                {this.state.tokenAdded ? (
                    <p className='text-white text-xs mt-2'>Token added successfully!</p>
                ) : (
                    <p></p>
                )}
            </div>
        );
    }
}

export default AddTokenButton;
