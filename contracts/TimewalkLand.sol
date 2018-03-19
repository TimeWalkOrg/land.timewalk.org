pragma solidity ^0.4.17;

import 'erc821/contracts/FullAssetRegistry.sol';


contract owned {
  address public owner;

  function owned() public {
    owner = msg.sender;
  }

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  function transferOwnership(address newOwner) onlyOwner public {
    owner = newOwner;
  }
}


contract TimewalkLand is owned, FullAssetRegistry {

  function TimewalkLand() public {
    _name = "TimewalkLand";
    _symbol = "TWL";
    _description = "Timewalk Land Tokens";
    owner = msg.sender;
  }

  // map assetId to placeId
  mapping(uint256 => string) placeIdLookup;

  // expressed in wei
  uint256 public sellPrice;
  uint256 public buyPrice;

  function setPrices(uint256 newSellPriceInFinney, uint256 newBuyPriceInFinney) onlyOwner public {
    sellPrice = newSellPriceInFinney * 1 finney;
    buyPrice = newBuyPriceInFinney * 1 finney;
  }

  function claim(string placeId) payable public {
    require(msg.value >= buyPrice);

    uint256 assetId = uint256(keccak256(placeId));

    _generate(assetId, msg.sender);

    placeIdLookup[assetId] = placeId;
  }

}
