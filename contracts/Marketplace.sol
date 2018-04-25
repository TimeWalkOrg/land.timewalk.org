pragma solidity ^0.4.17;

import './TimewalkLand.sol';

contract Marketplace {
    
    modifier onlyTokenContract() {
        require(msg.sender == address(tokenContract));
        _;
    }
    
    struct Order {
        uint price;
        address seller;
        uint timestamp;
        bool exists;
    }
    
    event SellOrder(address owner, uint assetId, uint price);
    event Bought(uint assetId, address buyer, uint price);
    event Canceled(address owner, uint assetId);
    
    uint public numOrders;

    mapping (uint => Order) public sellOrders;
    mapping(uint => uint) public positionOfToken;
    
    uint[] public tokensOnSale;
    
    TimewalkLand public tokenContract;
    
    function Marketplace(address _tokenAddress) public {
        tokenContract = TimewalkLand(_tokenAddress);
    }

    function sell(address _owner, uint _assetId, uint _amount) public onlyTokenContract {
        require(sellOrders[_assetId].exists == false);
        
        sellOrders[_assetId] = Order({
           price: _amount,
           seller: _owner,
           timestamp: now,
           exists: true
        });
        
        numOrders++;
        
        // set for iterating
        tokensOnSale.push(_assetId);
        positionOfToken[_assetId] = tokensOnSale.length - 1;
        
        //transfer ownership 
        tokenContract.transferFrom(_owner, this, _assetId);
        
        //Fire an sell event
        SellOrder(_owner, _assetId, _amount);
    }
    
    function buy(uint _assetId) public payable {
        require(sellOrders[_assetId].exists == true);
        require(msg.value >= sellOrders[_assetId].price);
        
        sellOrders[_assetId].exists = false;
        
        numOrders--;
        
        //delete stuff for iterating 
        removeOrder(_assetId);
        
        //transfer ownership 
        tokenContract.transferFrom(this, msg.sender, _assetId);
        
        // transfer money to seller
        uint price = sellOrders[_assetId].price;
            
        sellOrders[_assetId].seller.transfer(price);
                
        //fire and event
        Bought(_assetId, msg.sender, msg.value);
    }
    
    function cancel(uint _assetId) public {
        require(sellOrders[_assetId].exists == true);
        require(sellOrders[_assetId].seller == msg.sender);
        
        sellOrders[_assetId].exists = false;
        
        numOrders--;
        
        //delete stuff for iterating 
        removeOrder(_assetId);
        
        tokenContract.transferFrom(this, msg.sender, _assetId);
        
        //fire and event
        Canceled(msg.sender, _assetId);
    }
    
    function removeOrder(uint _assetId) internal {
        uint length = tokensOnSale.length;
        uint index = positionOfToken[_assetId];
        uint lastOne = tokensOnSale[length - 1];

        tokensOnSale[index] = lastOne;
        positionOfToken[lastOne] = index;

        delete tokensOnSale[length - 1];
        tokensOnSale.length--;
    }
    
    function getAlltokensOnSale() public view returns(uint[]) {
        return tokensOnSale;
    }
    
}