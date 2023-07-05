import Ticker from 'react-ticker';
import { ethers } from 'ethers'

const SaleHistory = (props) => {
  const property = props.property;
  let dateSoldHistory = [];
  if (property.dateSoldHistory) {    
    dateSoldHistory = property.dateSoldHistory.map(a => {
      const decimalValue = ethers.BigNumber.from(a).toNumber();
      return new Date(decimalValue * 1000).toString().substring(4,15);
    });
  }

  return (
    <div className="flex flex-col">
      <p className='text-indigo-100'>Sale History:</p>
      <div className='font-mono text-xs text-green-400'>
        {property.saleHistory == "Unsold" ? (
          <div className="w-full flex justify-start">
            <p>
              {property.saleHistory[0]}
            </p>
          </div>
        ) : (
          <div className='pl-0.5'>
            <Ticker speed={2}>
              {({ index }) => (
                <>
                  <div className="w-full pl-1 flex justify-center">
                    {property.saleHistory.map((item, index) => (
                      <p className='pr-2 whitespace-nowrap' key={index}>{`[${item["price"]} ${item["type"]}, ${dateSoldHistory[index]}]`}</p>
                    ))}

                    <p className="invisible pl-1">
                      {property.saleHistory[0]["price"]}
                    </p>
                  </div>
                </>
              )}
            </Ticker>
          </div>
        )}
      </div>
    </div>
  )
}

export default SaleHistory