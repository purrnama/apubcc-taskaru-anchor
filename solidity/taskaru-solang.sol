
@program_id("8cTeqUjgcLhLhD6nzVoioJ8sbDnitsz86TtFSNjyrVnr")
contract taskaru_solang {
    //data structs
    struct UserPortfolio {
        address user;
        uint64 tasksCompleted;
        bool isAcceptedTask;
        bool isSubmittedSolution;
        bytes1 bump;
    }

    struct TaskStatus {
        bool isAcceptedTask;
        bool isSubmittedSolution;
    }

    UserPortfolio public accountData;
    
    //account initializer
    @payer(payer)
    @seed("seed")
    constructor(@seed bytes payer, @bump bytes1 bump, address user){
        print("New UserPortfolio account initialized");
        accountData = UserPortfolio (user, 0, false, false, bump);
    }

    //functions
    //setters
    function setIsAcceptedTask(bool value) public {
        require(accountData.isSubmittedSolution == false, "user already submitted solution");
        require(accountData.isAcceptedTask != value, "attempt to assign same value");
        accountData.isAcceptedTask = value;
    }
    function submitSolution() public {
        require(accountData.isAcceptedTask == true, "user is not participating in the task");
        require(accountData.isSubmittedSolution == false, "attempt to submit another solution");
        accountData.isSubmittedSolution = true;
        accountData.tasksCompleted += 1;
    }
    function resetAll() public {
        accountData.tasksCompleted = 0;
        accountData.isAcceptedTask = false;
        accountData.isSubmittedSolution = false;
    }

    //getters
    function getTasksCompleted() public view returns (uint64) {
        return accountData.tasksCompleted;
    }
    function getIsAcceptedTask() public view returns (bool) {
        return accountData.isAcceptedTask;
    }
    function getIsSubmittedSolution() public view returns (bool) {
        return accountData.isSubmittedSolution;
    }
    function getTaskStatus() public view returns (TaskStatus) {
        return TaskStatus(accountData.isAcceptedTask, accountData.isSubmittedSolution);
    }
}