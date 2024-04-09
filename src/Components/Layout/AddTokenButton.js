import React from 'react';

class AddTokenButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tokenAdded: false
        };
        this.handleAddToken = this.handleAddToken.bind(this);
    }

    async handleAddToken() {
        const tokenAddress = "0xc0D47EAEB4fE7875EF6e8b39D5b93Cb65A63d54F";
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
                <button onClick={this.handleAddToken}>Add Token</button>
                {this.state.tokenAdded ? (
                    <p className='text-white'>Token added successfully!</p>
                ) : (
                    <p>Failed to add token.</p>
                )}
            </div>
        );
    }
}

export default AddTokenButton;
