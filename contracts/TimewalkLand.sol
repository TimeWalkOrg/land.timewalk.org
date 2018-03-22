pragma solidity ^0.4.17;

import 'erc821/contracts/FullAssetRegistry.sol';


contract Owned {
  address public owner;

  function Owned() public {
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


contract TimewalkLand is Owned, FullAssetRegistry {

  function TimewalkLand() public {
    _name = "TimewalkLand";
    _symbol = "TWL";
    _description = "First test of timewalk land tokens";
  }

  // map assetId to placeId
  mapping(uint256 => string) public placeIdLookup;

  // expressed in wei
  uint256 public price;

  function setPrices(uint256 _newPriceInFinneey) onlyOwner public {
    price = _newPriceInFinneey * 1 finney;
  }

  // check if the assetId is already taken
  function claim(string _placeData) payable public {
    require(msg.value >= price);

    uint256 assetId = uint256(keccak256(_placeData));

    if (bytes(placeIdLookup[assetId]).length == 0) {
      _generate(assetId, msg.sender);

      placeIdLookup[assetId] = _placeData;

      _update(assetId, _placeData);
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

  function withdraw() onlyOwner public {
    msg.sender.transfer(this.balance);
  }

}
