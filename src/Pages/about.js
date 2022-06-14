const About = () => {
  return (
    <div className="ml-6 text-white">
      <h1 className="mb-6">Property Ladder</h1>      
      <h3 className="mb-6">Build your own virtual property portfolio, become a landlord and start earning $$$ from your tenants!</h3>

      <h3>Introduction</h3>
      <p>1000 standard properties and 50 luxury properties are avaiable. No more will be created.</p>

      <h3>Buying A Property</h3>     
      <p>Properties can be bought by paying the asking price in MATIC or POG tokens (luxury properties POG only)</p>
      <p>- Property owners can resell their property for either MATIC or POG tokens.</p>

      <h3>Owning A Property</h3>
      <p>Owned properties are automatically listed as being available to rent</p>
      <p>Each property has 3 rooms avaiable to rent</p>
      <p>Owners can collect the rent from their tenants - Rent is paid in POLYGON/MATIC tokens</p>
      <p>Owners can set the rent price of their property</p>
      <p>Owners can evict a tenant if the tenant does not consistently pay rent</p>
      <p>Just like in real life, a property owner will need to keep on top of and manage their tenants. 
        If a tenant is late paying their rent, their address will flag in yellow <img className="scale-50" src="./late-tenant.png" alt="late-tenant" />
      </p>

      <h3>Renting a room in a property</h3>  
      <p>- Why rent a property?</p>   
      <p>Each time a renter pays rent to the property owner, they are rewared with POG tokens which can be used to 
        purchase a property as an alternative to paying in MATIC.         
      </p>      
      <p>The initial token price of 2000 POG works out to be cheaper than buying the property in MATIC. 
        Renting is ideal for those who don't want to fork out up front the MATIC to buy a property and is a cheaper pathway to 
        owning a property.
      </p>
      <p>If enough POG tokens are accumulated, you will be able to purchase a luxury property - availability permitting</p>
      <p>- How to rent a property</p>
      <p>To rent a room in a property, a small depost must be made</p>
      <p>A room can be vacated, upon which your deposit will be returned</p> 
      <p>You have the obligation of keeping up with your rent payments as the property owner can evict you, upon which, 
        you will lose your deposit
      </p>

      <h3>Selling A Property</h3>
      <p>Property owners can sell there property to others.</p>
      <p>Properties can be sold for MATIC and the owner can also choose to accept POG tokens as payments. *Note mixed payments are not avaiable.</p>
      <p></p>

      <h3>Luxury Properties</h3>
      <p>Luxury properties can only be purchased and sold using POG tokens</p>       
    </div>    
  )  
}

export default About