import axios from 'axios'

export class NftTagHelper {  

  getIdFromGraphUrl = (url) => {
    console.log("hit")
    const id = url.substring(19)    
    return id
  }

  getNftTags = async (arweaveId) => {
    const arweaveGraphUrl = "https://arweave.net/graphql";

    const options = {           
      method: 'POST',      
      url: arweaveGraphUrl,
      headers: {
        'content-type': 'application/json',
      },
      data: {
        query: `{
          transactions(ids:["${arweaveId}"]) {
            edges {
              node {
                tags {
                  name
                  value                  
                }
              }
            }
          }
        }`
      }
    };   
    return await axios
      .request(options)
      .then(function (response) {
        const res = response.data; // Response received from the API        
        return res
      })
      .catch(function (error) {
        console.error(error);
      });
  }
}