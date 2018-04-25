pragma solidity ^0.4.17;

import 'erc821/contracts/FullAssetRegistry.sol';
import './Owned.sol';
import './Marketplace.sol';

contract TimewalkLand is Owned, FullAssetRegistry {

  event Claimed(address _claimer, string _placeData, uint _assetId);

  function TimewalkLand() public {
    _name = "TimewalkLand";
    _symbol = "TWL";
    _description = "First test of timewalk land tokens";
  }

  // map assetId to placeId
  mapping(uint256 => string) public placeIdLookup;

  // expressed in wei
  uint256 public price;

  Marketplace public marketplaceContract;

  function setPrice(uint256 _newPriceInFinneey) onlyOwner public {
    price = _newPriceInFinneey * 1 finney;
  }

  function claim(string _placeData) payable public {
    require(msg.value >= price);

    uint256 assetId = uint256(keccak256(_placeData));

    if (bytes(placeIdLookup[assetId]).length == 0) {
      _generate(assetId, msg.sender);

      placeIdLookup[assetId] = _placeData;

      _update(assetId, _placeData);

      Claimed(msg.sender, _placeData, assetId);
    }
  }

  function placeAvailable(string _placeData) public view returns(bool) {
    uint256 assetId = uint256(keccak256(_placeData));

    if (bytes(placeIdLookup[assetId]).length == 0) {
      return true;
    } else {
      return false;
    }
  }

  function approveAndSell(uint _assetId, uint _amount) public {
    approve(address(marketplaceContract), _assetId);
    
    marketplaceContract.sell(msg.sender, _assetId, _amount);
  }

  function withdraw() onlyOwner public {
    msg.sender.transfer(this.balance);
  }

  function setMarketplaceContract(address _marketplace) public onlyOwner {
    require(address(marketplaceContract) == 0x0);
    
    marketplaceContract = Marketplace(_marketplace);
  }

}
