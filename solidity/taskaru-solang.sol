
@program_id("F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC")
contract taskaru_solang {
    //data structs
    UserScore private accountData;
    struct UserScore {
        address player;
        uint64 currentScore;
        uint64 highestScore;
        bytes1 bump;
    }

    //account initializer
    @payer(payer)
    @seed("seed")
    constructor(@seed bytes payer, @bump bytes1 bump, address player){
        print("New UserScore account initialized");
        accountData = UserScore (player, 0, 0, bump);
    }

    //functions
    //setters
    function addPoints(uint8 numPoints) public {
        require(numPoints > 0 && numPoints < 100, 'INVALID POINTS STOOPID');
        accountData.currentScore += numPoints;
        if (accountData.currentScore > accountData.highestScore) {
            accountData.highestScore = accountData.currentScore;
        }
    }

    function resetScore() public {
        accountData.currentScore = 0;
    }

    //getters
    function getCurrentScore() public view returns (uint64) {
        return accountData.currentScore;
    }
    function getHighestScore() public view returns (uint64) {
        return accountData.highestScore;
    }
}