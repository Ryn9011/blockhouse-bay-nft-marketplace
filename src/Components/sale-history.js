import Ticker from 'react-ticker';

import { useLocation } from 'react-router-dom';

const ethers = require("ethers")

/* global BigInt */

const SaleHistory = (props) => {
  const location = useLocation();
  const property = props.property;
  let dateSoldHistory = [];
  if (property.dateSoldHistory) {
    dateSoldHistory = property.dateSoldHistory.map(a => {      
    const bigIntValue = BigInt(a);      
    const decimalValue = Number(ethers.formatUnits(bigIntValue, 0));      
    const dateObject = new Date(decimalValue * 1000);  
    const dateString = dateObject.toDateString();
    return dateString.substring(4, 15);
    });
  }

  return (
    <div className="flex flex-col">
      {property.isForSale && location.pathname === '/to-rent' ? (
        <p className='text-indigo-100'>Sale History - <a href={`http://localhost:3000/property-view/${property.propertyId}`}
          className='cursor-pointer underline italic text-sm text-sky-400'>Currently Selling</a></p>
          
      ) : (
        <p className='text-indigo-100'>Sale History:</p>
      )}

      <div className='font-mono text-xs text-green-400'>
        {property.saleHistory == "Unsold" ? (
          <div className="w-full flex justify-start">
            <p>
              {property.saleHistory[0]}
            </p>
          </div>
        ) : (
          <div className='pl-0.5'>
            <Ticker speed={4}>
              {({ index }) => (
                <>
                  <div className="w-full pl-1 flex justify-center">
                    {property.saleHistory.map((item, index) => (
                      <p className='pr-8 whitespace-nowrap' key={index}>{`[${item["price"]} ${item["type"]}, ${dateSoldHistory[index]}]`}</p>
                    ))}
                    <p className="invisible pl-2">
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