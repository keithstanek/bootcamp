pragma solidity ^0.5.4;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Token.sol";

contract Exchange {
    using SafeMath for uint;

    // TODO
    // [x] Set the fee account
    // [x] Deposit ether
    // [x] Withdraw ether
    // [x] Deposit tokens
    // [x] Withdraw tokens
    // [x] Check balances
    // [x] Make order
    // [] Cancel order
    // [] Fill order
    // [] Charge fees

    string public name = "Stanky Token Exchange Contract";
    address public feeAccount;  // account that receives the fees --> money maker
    uint256 public feePercent;
    mapping(address => mapping(address => uint256)) public tokens;
    address constant ETHER = address(0); // allows us to store ether tokens mapping with blank address
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount = 0;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;

    // Events
    event Deposit(address indexed token, address indexed user, uint256 amount, uint256 balance);
    event Withdraw(address indexed token, address indexed user, uint256 amount, uint256 balance);
    event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
    event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
    event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address userFill, uint256 timestamp);

    // Orders:
    // Need to model the order
    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }
    // Need to store the order
    // Add order to storage

    constructor(address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // fallback: reverts if Ether is sent ot the smart contract by mistake
    function() external {
        revert();
    }

    function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount,  "Transfer amount invalid, not enough Ether in the account to make the transaction");
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        msg.sender.transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint _amount) public {
        // TODO: Don't allow ether deposits
        require(_token != ETHER, "No Ether deposits allowed through this function call");
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
        // which token?
        // how much?
        // manage deposit - update balance
        // emit event
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount,  "Transfer amount invalid, not enough Stanky Token in the account to make the transaction");
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns (uint256){
        return tokens[_token][_user];
    }

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
    }

    function cancelOrder(uint256 _orderId) public {
        _Order storage _order = orders[_orderId];
        // must be my orderCancelled
        require(address(_order.user) == msg.sender, "Trying to cancel an order that doesn't belong to you");
        require(_order.id == _orderId, "Invalid order ID");
        // must be valid order
        orderCancelled[_orderId] = true;
        emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);
    }

    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount);
        require(!orderCancelled[_id]);
        require(!orderFilled[_id]);

        _Order storage _order = orders[_id];
        _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);

        // mark order as filled
        orderFilled[_id] = true;
    }

    function _trade(uint256 _id, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal { // private function
        uint256 _feeAmount = _amountGive.mul(feePercent).div(100);
        // execute trade
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);

        // add fee account
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);

        tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);

        emit Trade(_id, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, now);
    }
}