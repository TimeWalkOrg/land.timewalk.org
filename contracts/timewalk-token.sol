pragma solidity ^0.4.18;

// https://ethereum.org/token

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


contract TimewalkToken is owned{
    /* This creates an array with all balances */
    mapping (address => uint256) public balanceOf;

    // Public variables of the token
    string public name;
    string public symbol;
    uint8 public decimals = 0;
    // 18 decimals is the strongly suggested default, avoid changing it

    uint256 public totalSupply;


    /* Initializes contract with initial supply tokens to the creator of the contract */
    function TimewalkToken(
        uint256 initialSupply,
        string tokenName,
        string tokenSymbol,
        address centralMinter
        ) public {
        if(centralMinter != 0)
            owner = centralMinter;

        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;              // Give the creator all initial tokens
        name = tokenName;                                   // Set the name for display purposes
        symbol = tokenSymbol;                               // Set the symbol for display purposes
    }

    // fallback function to accept ether
    function () payable public {}


    uint minBalanceForAccounts;

    function setMinBalance(uint minimumBalanceInFinney) onlyOwner public {
         minBalanceForAccounts = minimumBalanceInFinney * 1 finney;
    }


    // expressed in wei
    uint256 public sellPrice;
    uint256 public buyPrice;

    function setPrices(uint256 newSellPriceInFinney, uint256 newBuyPriceInFinney) onlyOwner public {
        sellPrice = newSellPriceInFinney * 1 finney;
        buyPrice = newBuyPriceInFinney * 1 finney;
    }


    /* Send coins */
    function transfer(address _to, uint256 _value) public {
        require(_to != 0x0);                                // prevent transfer to 0x0 address. Use burn() instead
        require(balanceOf[msg.sender] >= _value);           // Check if the sender has enough
        require(balanceOf[_to] + _value >= balanceOf[_to]); // Check for overflows
        balanceOf[msg.sender] -= _value;                    // Subtract from the sender
        balanceOf[_to] += _value;                           // Add the same to the recipient

        if(msg.sender.balance < minBalanceForAccounts)
            sell((minBalanceForAccounts - msg.sender.balance) / sellPrice);

        /* Notify anyone listening that this transfer took place */
        Transfer(msg.sender, _to, _value);
    }


    function mintToken(address target, uint256 mintedAmount) onlyOwner public {
        balanceOf[target] += mintedAmount;
        totalSupply += mintedAmount;
        Transfer(0, owner, mintedAmount);
        Transfer(owner, target, mintedAmount);
    }


    /**
     * Destroy tokens
     *
     * Remove `_value` tokens from the system irreversibly
     *
     * @param _value the amount of money to burn
     */
    function burn(uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);   // Check if the sender has enough
        balanceOf[msg.sender] -= _value;            // Subtract from the sender
        totalSupply -= _value;                      // Updates totalSupply
        Burn(msg.sender, _value);
        return true;
    }


    function buy() payable public returns (uint amount) {
        // msg.value is amount of wei sent with message
        // http://solidity.readthedocs.io/en/develop/units-and-global-variables.html?highlight=balance#block-and-transaction-properties

        amount = msg.value / buyPrice;                    // calculates the amount
        require(balanceOf[this] >= amount);               // checks if it has enough to sell
        balanceOf[msg.sender] += amount;                  // adds the amount to buyer's balance
        balanceOf[this] -= amount;                        // subtracts amount from seller's balance
        Transfer(this, msg.sender, amount);               // execute an event reflecting the change
        return amount;
    }


    function sell(uint amount) public returns (uint revenue) {
        require(balanceOf[msg.sender] >= amount);         // checks if the sender has enough to sell
        balanceOf[this] += amount;                        // adds the amount to owner's balance
        balanceOf[msg.sender] -= amount;                  // subtracts the amount from seller's balance
        revenue = amount * sellPrice;

        // .send() is expressed in wei
        // http://solidity.readthedocs.io/en/develop/units-and-global-variables.html#address-related

        require(msg.sender.send(revenue));                // sends ether to the seller: it's important to do this last to prevent recursion attacks
        Transfer(msg.sender, this, amount);               // executes an event reflecting on the change
        return revenue;
    }


    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);

    // This notifies clients of the amount burnt
    event Burn(address indexed from, uint256 value);

}
