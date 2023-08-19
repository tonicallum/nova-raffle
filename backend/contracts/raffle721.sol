// SPDX-License-Identifier: MIT
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RaffleTypes.sol";

pragma solidity >=0.8.0 <0.9.0;

contract NFT721Raffle is
    AccessControl,
    ReentrancyGuard,
    VRFConsumerBaseV2,
    ConfirmedOwner
{
    Config public config;
    VRFCoordinatorV2Interface private coordinator;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");

    mapping(uint64 => RaffleStruct) public idToRaffleItem;
    mapping(uint64 => EntriesBought[]) public raffleIdToBuyerEntries;
    mapping(uint256 => uint64) public requestIdToRaffleId;

    event RaffleCreate(
        uint64 indexed _raffleId,
        address indexed _nftAddress,
        uint32 indexed _nftId
    );
    event RaffleTicketSold(
        uint64 indexed _raffleId,
        uint32 indexed _ticketId,
        address indexed _owner
    );
    event RaffleClaim(
        uint64 indexed _raffleId,
        address indexed _user,
        CLAIM_TYPE _type
    );
    event RaffleStatus(uint64 indexed _raffleId, STATUS indexed status);
    event ConfigChanged(uint32 _fee, address _feeReceiver);

    constructor(
        uint64 _subId,
        address _vrfCoordinator,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(_vrfCoordinator) ConfirmedOwner(msg.sender) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        config = Config({
            subId: _subId,
            raffleIndex: 0,
            vrfGasLimit: 200000,
            vrfConfirms: 5,
            maxSupply: 10000,
            maxDuration: 2592000,
            platformFeeReceiver: msg.sender,
            platformFee: 200,
            keyHash: _keyHash
        });
        coordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    }

    // NFT Approve is required before calling
    function createRaffle(
        address _nftAddress,
        uint32 _nftId,
        uint32 _price,
        uint32 _startTime,
        uint32 _expirationTime,
        uint16 _totalSupply
    ) external nonReentrant returns (uint64) {
        if (_startTime < block.timestamp || _expirationTime < _startTime)
            revert("InvalidStartDate");
        if (_startTime < block.timestamp) revert("StartTimeMustBeInTheFuture");
        if (_expirationTime < _startTime)
            revert("ExpirationTimeMustBeAfterStartTime");

        uint32 duration = _expirationTime - uint32(_startTime);
        if (duration < 86400 || duration > config.maxDuration)
            revert("DurationLimited");
        if (_totalSupply < 2 || _totalSupply > config.maxSupply)
            revert("SupplyLimited");

        uint256 chainId = getCurrentChainID();
        if (chainId == 137) {
            // POLYGON MAIN
            if (_price < 1e4 || _price > 9999000000)
                revert("Price limit 0.01~9999 MATIC");
        } else if (chainId == 80001) {
            // POLYGON TEST
            if (_price < 1e4 || _price > 3000000000)
                revert("Price limit 0.01~3000 MATIC");
        } else {
            // ETH
            if (_price < 1000 || _price > 100000000)
                revert("Price limit 0.001~100 ETH");
        }

        IERC721 asset = IERC721(_nftAddress);
        asset.transferFrom(msg.sender, address(this), _nftId);

        RaffleStruct memory raffle = RaffleStruct({
            nftAddress: _nftAddress,
            nftId: _nftId,
            startTime: _startTime,
            expirationTime: _expirationTime,
            totalSupply: _totalSupply,
            currentSupply: 0,
            creator: msg.sender,
            price: _price,
            randomIndex: 0,
            settled: false,
            status: STATUS.NORMAL
        });
        idToRaffleItem[++config.raffleIndex] = raffle;

        emit RaffleCreate(config.raffleIndex, _nftAddress, _nftId);
        return config.raffleIndex;
    }

    function buyTicket(
        uint64 _raffleId,
        uint16 _qty
    ) external payable nonReentrant {
        enterRaffle(_raffleId, _qty, msg.sender);
    }

    function offerRaffleTicket(
        uint64 _raffleId,
        uint16 _qty,
        address _receiptAddress
    ) external payable nonReentrant {
        enterRaffle(_raffleId, _qty, _receiptAddress);
    }

    function enterRaffle(
        uint64 _raffleId,
        uint16 _qty,
        address _receiptAddress
    ) internal {
        RaffleStruct memory raffle = idToRaffleItem[_raffleId];
        if (raffle.status != STATUS.NORMAL) revert("Wrong status");
        if (msg.sender == raffle.creator) revert("Disallow creator");
        if (block.timestamp < raffle.startTime) revert("Raffle not started");
        if (block.timestamp >= raffle.expirationTime) revert("Raffle expired");
        if (msg.value != uint256(raffle.price) * _qty * 1e12)
            revert("Incorrect amount");
        if (_qty == 0 || _qty > raffle.totalSupply - raffle.currentSupply)
            revert("Wrong entries");

        uint32 ticketId = uint32(raffleIdToBuyerEntries[_raffleId].length);
        EntriesBought memory entryBought = EntriesBought({
            owner: _receiptAddress,
            currentIndex: raffle.currentSupply + _qty,
            entryNum: _qty,
            ticketId: ticketId
        });
        raffleIdToBuyerEntries[_raffleId].push(entryBought);
        idToRaffleItem[_raffleId].currentSupply += _qty;

        emit RaffleTicketSold(_raffleId, ticketId, msg.sender);
    }

    function initiateRaffleDrawing(
        uint64 _raffleId
    ) external nonReentrant onlyRole(OPERATOR_ROLE) {
        RaffleStruct memory raffle = idToRaffleItem[_raffleId];

        // Unsold entries cannot draw
        if (raffle.status != STATUS.NORMAL || raffle.currentSupply == 0)
            revert("Wrong status");

        if (
            raffle.currentSupply == raffle.totalSupply ||
            block.timestamp > uint256(raffle.expirationTime)
        ) {
            requestRandomNumber(_raffleId);
            idToRaffleItem[_raffleId].status = STATUS.DRAWNIG;
        } else {
            // Not sold out and under the deadline
            revert("Not sold out & deadline");
        }

        emit RaffleStatus(_raffleId, STATUS.DRAWNIG);
    }

    function cancelRaffle(uint64 _raffleId) external nonReentrant {
        RaffleStruct memory raffle = idToRaffleItem[_raffleId];

        if (msg.sender != raffle.creator) revert("Not owned");
        if (raffle.currentSupply > 0) revert("Already sold");

        IERC721 asset = IERC721(raffle.nftAddress);
        asset.transferFrom(address(this), msg.sender, raffle.nftId);

        idToRaffleItem[_raffleId].status = STATUS.CANCELLED;
        emit RaffleStatus(_raffleId, STATUS.CANCELLED);
    }

    function requestRandomNumber(uint64 _raffleId) internal {
        uint256 requestId = coordinator.requestRandomWords(
            config.keyHash,
            config.subId,
            config.vrfConfirms,
            config.vrfGasLimit,
            1
        );
        requestIdToRaffleId[requestId] = _raffleId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        uint64 raffleId = requestIdToRaffleId[_requestId];
        RaffleStruct memory raffle = idToRaffleItem[raffleId];

        // random index in [1 - sold numbers]
        uint256 randomIndex = (_randomWords[0] % raffle.currentSupply) + 1;
        idToRaffleItem[raffleId].randomIndex = uint16(randomIndex);
        idToRaffleItem[raffleId].status = STATUS.DRAWED;

        emit RaffleStatus(raffleId, STATUS.DRAWED);
    }

    function claimWinnings(uint64 _raffleId) external nonReentrant {
        RaffleStruct memory raffle = idToRaffleItem[_raffleId];
        if (raffle.status != STATUS.DRAWED || raffle.currentSupply == 0)
            revert("Wrong status");

        address winner = calculateWinner(_raffleId, raffle.randomIndex);
        if (winner != msg.sender) revert("Not the winner");

        IERC721 asset = IERC721(raffle.nftAddress);
        asset.transferFrom(address(this), winner, raffle.nftId);

        idToRaffleItem[_raffleId].status = STATUS.CLAIMED;
        emit RaffleClaim(_raffleId, msg.sender, CLAIM_TYPE.WINNER);
    }

    function claimCreatorFunds(
        uint64 _raffleId,
        ClaimData memory _claimData
    ) external nonReentrant {
        if (_claimData.platformFeeOff > config.platformFee)
            revert("InvalidParams");
        if (!verifySignature(_raffleId, _claimData))
            revert("Signature invalid");

        RaffleStruct memory raffle = idToRaffleItem[_raffleId];
        if (raffle.settled) revert("Creator claimed");
        if (raffle.creator != msg.sender) revert("Not the creator");
        if (raffle.status != STATUS.DRAWED && raffle.status != STATUS.CLAIMED)
            revert("Wrong status");

        unchecked {
            uint32 platformFee = config.platformFee - _claimData.platformFeeOff;
            uint256 amountRaised = uint256(raffle.price) *
                raffle.currentSupply *
                1e12;
            uint256 amountForPlatform = (amountRaised * platformFee) /
                10000 +
                _claimData.linkFee;

            if (amountRaised > amountForPlatform) {
                (bool sent, ) = config.platformFeeReceiver.call{
                    value: amountForPlatform
                }("");
                if (!sent) revert("Failed to pay platform");

                uint256 amountForCreator = amountRaised - amountForPlatform;
                (bool sentS, ) = raffle.creator.call{value: amountForCreator}(
                    ""
                );
                if (!sentS) revert("Failed to pay creator");
            } else {
                // sales can not cover the platform fee & chainlink fee
                (bool sent, ) = config.platformFeeReceiver.call{
                    value: amountRaised
                }("");
                if (!sent) revert("Failed to pay platform");
            }
        }

        idToRaffleItem[_raffleId].settled = true;
        emit RaffleClaim(_raffleId, msg.sender, CLAIM_TYPE.CREATOR);
    }

    function calculateWinner(
        uint64 _raffleId,
        uint256 _randomIndex
    ) public view returns (address) {
        uint256 position = findUpperBound(
            raffleIdToBuyerEntries[_raffleId],
            _randomIndex
        );
        return raffleIdToBuyerEntries[_raffleId][position].owner;
    }

    /// https://docs.openzeppelin.com/contracts/3.x/api/utils#Arrays-findUpperBound-uint256---uint256-
    function findUpperBound(
        EntriesBought[] memory array,
        uint256 randomIndex
    ) internal pure returns (uint256) {
        if (array.length == 0) return 0;

        uint256 low = 0;
        uint256 high = array.length;

        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (array[mid].currentIndex > randomIndex) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        if (low > 0 && array[low - 1].currentIndex == randomIndex) {
            return low - 1;
        } else {
            return low;
        }
    }

    // Verifying the signer role
    function verifySignature(
        uint64 _raffleId,
        ClaimData memory _claimData
    ) internal view returns (bool) {
        bytes32 messagehash = keccak256(
            abi.encodePacked(
                _raffleId,
                _claimData.platformFeeOff,
                _claimData.linkFee,
                address(this),
                getCurrentChainID()
            )
        );
        address signer = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(messagehash),
            _claimData.signature
        );
        return hasRole(OPERATOR_ROLE, signer);
    }

    function setRafflePlatformFee(
        uint32 _fee,
        address payable _feeReceiver
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        config.platformFee = _fee;
        config.platformFeeReceiver = _feeReceiver;
        emit ConfigChanged(_fee, _feeReceiver);
    }

    function setMaximumDurationAndSupply(
        uint32 _maxDuration,
        uint16 _maxSupply
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        config.maxDuration = _maxDuration;
        config.maxSupply = _maxSupply;
    }

    function setChainlinkVRF(
        uint64 _subId,
        bytes32 _keyHash,
        uint32 _vrfGasLimit,
        uint16 _vrfConfirms
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        config.subId = _subId;
        config.keyHash = _keyHash;
        config.vrfGasLimit = _vrfGasLimit;
        config.vrfConfirms = _vrfConfirms;
    }

    function getAllRaffles() public view returns (RaffleStruct[] memory) {
        uint totalRaffleLength = config.raffleIndex;

        RaffleStruct[] memory raffles = new RaffleStruct[](totalRaffleLength);
        for (uint64 i = 1; i <= totalRaffleLength; i++) {
            raffles[i - 1] = idToRaffleItem[i];
        }

        return raffles;
    }

    function getTicketsBought (
        uint64 _raffleId
    ) external view returns (EntriesBought[] memory) {
        return raffleIdToBuyerEntries[_raffleId];
    }

    function getCurrentChainID() private view returns (uint256 id) {
        assembly {
            id := chainid()
        }
    }
}
