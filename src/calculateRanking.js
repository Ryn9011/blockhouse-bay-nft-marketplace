import { ethers } from 'ethers'

const calculateRankingTotal = (property) => {
  let maxSale = property.saleHistory.reduce((accumulator, current) => {     
    if (current["price"] === undefined) return accumulator;
    return Math.max(accumulator, parseInt((current["price"])));      
  }, 0);
  
  console.log(maxSale)
  return maxSale + Number(property.totalIncomeGenerated)
};

const calculateRankingPosition = (properties) => {
  const propertyTotals = properties.map((property) => ({ id: property.propertyId, total: property.ranking }));

  propertyTotals.sort((a, b) => b.total - a.total);

  const rankingMap = new Map();
  propertyTotals.forEach((property, index) =>   
    rankingMap.set(property.id, index + 1)
  );

  let sorted = [...properties].sort((a, b) => b.ranking - a.ranking);
  console.log(sorted);

  sorted.forEach((property) => {  
    console.log(property.ranking)  
    property.ranking = property.ranking === 0 ? "unranked" : rankingMap.get(property.propertyId);
  });




  return sorted;
};

export { calculateRankingTotal, calculateRankingPosition };

