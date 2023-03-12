import React, { useEffect } from "react";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles({
  root: {
    backgroundColor: 'transparent',
    border: '1px 0px 1px 0px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '4px',
    boxShadow: 'none',
    color: '#a0aec0',
  },
  summary: {
    padding: '16px',
    color: '#a0aec0',
  },
  summaryExpanded: {
    color: '#fff',
    background: 'black'
  },
  details: {
    padding: '0 16px 16px 16px',
    color: '#fff',
    background: 'black'
  },
});


const About = () => {

  const [expanded, setExpanded] = React.useState(false);
  const classes = useStyles();

  useEffect(() => {
    setExpanded('panel7')
  }, [])

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className="ml-2 mr-2 mb-12">
      <Accordion className={classes.root} expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} className={`${classes.summary} ${expanded === 'panel1' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
          <div className="flex j">
            <h2 className="mr-4 hidden md:block">Blockhouse Bay</h2>
            <h3 className="mr-4 md:hidden">Blockhouse Bay</h3>
            {/*<img className="w-1/4" src="polylogo2.png" /> */}
          </div>
        </AccordionSummary>

        <AccordionDetails className={classes.details}>
          <div className="lg:grid justify-items-center mb-32 lg:mb-4 lg:grid-cols-2 lg:gap-16 xl3:gap-32 lg:text-xl text-lg xl:text-xl 2xl:text-2xl">
            {/* <img className="p-6 pt-0" src="about.jpeg" /> */}
            <div>
              <ul className="divide-y divide-gray-200 lg:ml-24">
                <li className="py-4">
                  <div className="flex justify-end">
                    {/* <h3 className=" mr-3" >Powered By</h3> */}
                    <img className="w-3/5 md:w-2/5 max-w-[22rem]" src="poly.png" />
                  </div>

                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Blockhouse Bay Real Estate Simulation</h3>
                  <p className="mt-2 text-gray-500">
                    Blockhouse Bay is a real-estate simulation that utilizes Web 3 technologies and the Polygon blockchain .
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Landlord or Tenant or Both</h3>
                  <p className="mt-2 text-gray-500">
                    As a user, you have the option to assume the role of a landlord, tenant, or both.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Earn Real $$$ or BHB Tokens</h3>
                  <p className="mt-2 text-gray-500">
                    As a landlord, you can earn real money from your renters or receive Blockhouse Bay tokens (BHB) each time rent is paid. Purchasing with tokens is a more cost-effective way to buy property compared to purchasing with Matic tokens.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Exclusive Properties</h3>
                  <p className="mt-2 text-gray-500">
                    There are some amazing exclusive properties to be bought which can only be purchased with BHB tokens. Check them out at <a href="LINK_TO_EXCLUSIVE_PROPERTIES" className="text-yellow-200 hover:text-yellow-200">Exclusive Properties</a>.
                  </p>
                </li>
              </ul>
            </div>
            <div className="gallery lg:mr-12 ml-3.5 mt-8 lg:mt-0 lg:mb-96 mb-24 xs:ml-5 xs2:ml-8 xs2:mb:32 sm:mb-32 sm:ml-24 md:ml-44 md:mb-32">
              <div className="clipped-border">
                <img src="house1.jpeg" id="clipped" />
              </div>
              <div className="clipped-border">
                <img src="house2.jpeg" id="clipped" />
              </div>
              <div className="clipped-border">
                <img src="house6.jpeg" id="clipped" />
              </div>
              <div className="clipped-border">
                <img src="house4.jpeg" id="clipped" />
              </div>
              <div className="clipped-border">
                <img src="house5.jpeg" id="clipped" />
              </div>
              <div className="shadow"></div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      <Accordion className={classes.root} expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} className={`${classes.summary} ${expanded === 'panel3' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
          <h2 className="mr-4 hidden md:block">Buying a Property</h2>
          <h3 className="mr-4 md:hidden">Buying a Property</h3>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:text-lg text-lg xl:text-xl lg:ml-24 2xl:text-2xl">
            <ul className="divide-y divide-gray-200">
              <li className="py-4">
                <h3 className="text-lg font-semibold">NFT Properties for Sale</h3>
                <p className="mt-2 text-gray-500">
                  500 beautiful NFT properties are available for purchase, which can be rented out to earn a profit.
                </p>
                <p className="mt-2 text-gray-500">
                  <a href="#" className="text-yellow-200">View properties for sale</a>
                </p>
              </li>
              <li className="py-4">
                <h3 className="text-lg font-semibold">Payment Options</h3>
                <p className="mt-2 text-gray-500">
                  Properties can be bought by paying the asking price in MATIC or BHB tokens. BHB tokens can be obtained by paying rent on a property for which the buyer is currently a tenant.
                </p>
              </li>
              <li className="py-4">
                <h3 className="text-lg font-semibold">Property Resale</h3>
                <p className="mt-2 text-gray-500">
                  Property owners have the option to resell their property for either MATIC or BHB tokens.
                </p>
              </li>
            </ul>
            <div className="lg:ml-16 content-center">
              <div className="flex justify-center sm:justify-start 2xl:justify-center">
                <img className="p-4 mt-4 transform rotate-3 sm:h-3/5 sm:w-4/5 md:h-1/5 md:w-2/5 lg:w-full lg:h-full xl:h-4/5 xl:w-4/5 2xl:h-4/6 2xl:w-4/6 max-w-[40rem]" src="buying3.jpeg" />
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      <Accordion className={classes.root} expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} className={`${classes.summary} ${expanded === 'panel6' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
          <h2 className="mr-4 hidden md:block">Owning a Property</h2>
          <h3 className="mr-4 md:hidden">Owning a Property</h3>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <div className="lg:grid lg:grid-cols-3 lg:gap-4 lg:text-lg text-lg xl:text-xl lg:ml-24">
            <div className="col-span-2 text-lg xl:text-2xl">
              <ul className="divide-y divide-gray-200">
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Manage Properties and Collect Rent</h3>
                  <p className="mt-2 text-gray-500">
                    Property owners can easily manage each of their properties and collect rent from the user-friendly Property Management Panel.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Withdraw Accumulated Rent</h3>
                  <p className="mt-2 text-gray-500">
                    Any uncollected rent will accumulate and can be withdrawn at the owner's convenience.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Automatic Property Listing</h3>
                  <p className="mt-2 text-gray-500">
                    Owned properties are automatically listed as available to rent for potential tenants.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">3 Rooms Available</h3>
                  <p className="mt-2 text-gray-500">
                    Each property has three rooms available for tenants to rent.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Rent Collection</h3>
                  <p className="mt-2 text-gray-500">
                    Owners can effortlessly collect rent from their tenants, which is paid in MATIC tokens.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Set Rent Price</h3>
                  <p className="mt-2 text-gray-500">
                    Property owners have complete control over their rental properties and can set the rent price to their desired amount.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Eviction</h3>
                  <p className="mt-2 text-gray-500">
                    Owners can evict a tenant if they fail to consistently pay rent.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Monitoring of Rent Payments</h3>
                  <p className="mt-2 text-gray-500">
                    To help owners stay on top of their tenants, any address with late rent payment will flag in yellow.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Property Sale</h3>
                  <p className="mt-2 text-gray-500">
                    Property owners have the option to sell their property to other interested buyers. A listing fee of 5 Matic will incur.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Payment Options</h3>
                  <p className="mt-2 text-gray-500">
                    Properties can be sold for MATIC, and owners can choose to accept BHB tokens as payment, but mixed payments are not available.
                  </p>
                </li>
              </ul>
              <br />
            </div>
            <div className="flex justify-center">
              <img className="max-h-[64rem] max-w-[24rem] lg:w-3/4 p-4 xs2:p-6 xs2:w-3/4 lg:w-4/6 lg:h-full pt-4 lg:pt-0 mt-4 lg:mt-0 sm:h-1/4 sm:w-3/4 md:h-2/4 md:w-2/4" src="./ownerpanel.png" />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      <Accordion className={classes.root} expanded={expanded === 'panel7'} onChange={handleChange('panel7')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} className={`${classes.summary} ${expanded === 'panel7' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
          <h2 className="mr-4 hidden md:block">Renting a Property</h2>
          <h3 className="mr-4 md:hidden">Renting a Property</h3>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <div className="lg:grid lg:grid-cols-3 lg:gap-4 lg:text-lg text-lg xl:text-xl">
            <div className="lg:col-span-2 lg:pr-64 text-justify xl:text-2xl lg:ml-24">
              <ul className="divide-y divide-gray-200">
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Rent a Room</h3>
                  <p className=" text-gray-500">
                    <a href="#" className="text-yellow-200 hover:underline">
                      Rental Properties
                    </a> with at least one available spare room can be leased from property owners.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Each time a renter pays rent to the property owner, they are rewarded with BHB tokens which can be used to purchase a property as an alternative to paying in MATIC.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Cheaper Token Price</h3>
                  <p className="mt-2 text-gray-500">
                    The initial token price of 2000 BHB works out to be cheaper than buying the property in MATIC. Renting is ideal for those who don't want to fork out up front the MATIC to buy a property and is a cheaper pathway to owning a property.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Luxury Property</h3>
                  <p className="mt-2 text-gray-500">
                    If enough BHB tokens are accumulated, you will be able to purchase a luxury property - availability permitting.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Deposit Required</h3>
                  <p className="mt-2 text-gray-500">
                    To rent a room in a property, a small deposit must be made (AMOUNT).
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Deposit Refund</h3>
                  <p className="mt-2 text-gray-500">
                    A room can be vacated, upon which your deposit will be returned.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg font-semibold">Rent Payment Obligation</h3>
                  <p className="mt-2 text-gray-500">
                    You have the obligation of keeping up with your rent payments as the property owner can evict you, upon which, you will lose your deposit.
                  </p>
                </li>
              </ul>
            </div>
            <div>
              <div className="flex max-w-[34rem] p-12 pt-0 justify-center sm:justify-start">
                <img className="max-h-[42rem]" src="./rentpanel.png" />
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      <Accordion className={classes.root} expanded={expanded === 'panel8'} onChange={handleChange('panel8')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} className={`${classes.summary} ${expanded === 'panel8' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
          <h2 className="mr-4 hidden md:block">Exclusive Properties</h2>
          <h3 className="mr-4 md:hidden">Exclusive Properties</h3>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:text-lg text-lg xl:text-xl xl:text-2xl pb-8">
            <ul className="divide-y divide-gray-200 lg:ml-24">
              <li className="py-4">
                <h3 className="text-lg font-semibold">Exclusive Properties</h3>
                <p className="mt-2 text-gray-500">
                  Blockhouse Bay Gardens, an exclusive street of grand and stunning homes, 
                  is a paradise of luxurious living. From impressive architecture to immaculate gardens, 
                  each house is a masterpiece of sophistication, 
                  offering an unparalleled lifestyle in one of the bay's most beautiful settings. </p>
              </li>
              <li className="py-4">
                <h3 className="text-lg font-semibold">Buying</h3>
                <p className="mt-2 text-gray-500">Properties on <a className="text-yellow-200 hover:text-yellow-200">Blockhouse Bay Gardens</a> can only be purchased and sold using BHB tokens</p>
              </li>            
            </ul>
            <div className="flex justify-center mr-4">
              <img className="p-4 mt-4 transform rotate-3 sm:h-3/5 sm:w-4/5 md:h-1/5 md:w-2/5 lg:w-full lg:h-full xl:h-5/5 xl:w-4/5 2xl:h-full 2xl:w-4/6 max-w-[40rem]" src="housemain.jpeg" />
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

export default About