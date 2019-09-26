const BLOCK_SIZE = 9;
const NUM_BLOCKS = 4;
const NEGATIVE_LIMIT = -99;
const POSITIVE_LIMIT = 99;
const BLOCKS = Array.from(new Array(NUM_BLOCKS).keys(), x => x + 1)
const INDICES = Array.from(new Array(BLOCK_SIZE).keys())
const MARKERSIZE = 15;
const CTRSCALE = 25;
const AICOLOR = "black"
const PLAYERCOLOR = "white"
const PLAYERHILIGHT = "#00c28a"
const MARKERCOLOR = "#bdd369"

const SCALETOINDEX = {
    1 : {
        1: 0,
        3: 3,
        5: 6
    },
    3 : {
        1: 1,
        3: 4,
        5: 7
    },
    5 : {
        1: 2,
        3: 5,
        5: 8
    }
}

//  All possible goal states
const GOAL_STATES = [ {1:[0, 3, 6], 3:[0, 3] }, // Vertical
                {1:[1, 4, 7], 3:[1, 4] },
                {1:[2, 5, 8], 3:[2, 5] },
                {1:[3, 6], 3:[0, 3, 6] },
                {1:[4, 7], 3:[1, 4, 7] },
                {1:[5, 8], 3:[2, 5, 8] },
                {2:[0, 3, 6], 4:[0, 3] },
                {2:[1, 4, 7], 4:[1, 4] },
                {2:[2, 5, 8], 4:[2, 5] },
                {2:[3, 6], 4:[0, 3, 6] },
                {2:[4, 7], 4:[1, 4, 7] },
                {2:[5, 8], 4:[2, 5, 8] },
                {1:[0, 1, 2], 2:[0, 1] }, // Horizontal
                {1:[3, 4, 5], 2:[3, 4] },
                {1:[6, 7, 8], 2:[6, 7] },
                {1:[1, 2], 2:[0, 1, 2] },
                {1:[4, 5], 2:[3, 4, 5] },
                {1:[7, 8], 2:[6, 7, 8] },
                {3:[0, 1, 2], 4:[0, 1] },
                {3:[3, 4, 5], 4:[3, 4] },
                {3:[6, 7, 8], 4:[6, 7] },
                {3:[1, 2], 4:[0, 1, 2] },
                {3:[4, 5], 4:[3, 4, 5] },
                {3:[7, 8], 4:[6, 7, 8] },
                {1:[0, 4, 8], 4:[0, 4] }, // Diagonal
                {1:[1, 5], 2:[6], 4:[1, 5] },
                {1:[3, 7], 3:[2], 4:[3, 7] },
                {1:[8], 2:[1, 3], 3:[1, 3] },
                {1:[4, 8], 4:[0, 4, 8] },
                {2:[2, 4, 6], 3:[2, 4] },
                {2:[4, 6], 3:[2, 4, 6] },
                {2:[5, 7], 4:[0], 3:[5, 7] } 
];

// UI Variables
var blockOne = document.getElementById("blockOne");
var blockTwo = document.getElementById("blockTwo");
var blockThree = document.getElementById("blockThree");
var blockFour = document.getElementById("blockFour");

const GAMEBLOCKS = {
    "blockOne": [blockOne, blockOne.getContext("2d"), 1],
    "blockTwo": [blockTwo, blockTwo.getContext("2d"), 2],
    "blockThree": [blockThree, blockThree.getContext("2d"), 3],
    "blockFour": [blockFour, blockFour.getContext("2d"), 4]
}

// Tracks board positions that are filled
var board = resetBoard();
var playerToken = "w"
var AI = "b"
var playerTurn = true
var isGameOver = false
var randomMove = false;
var turnCount = 0;

initGameBoards();

// ---------------- Mouse Events ----------------

// Highlights the block's position based upon mouse position
var highlightFn = function (evt) {
    var xcoord = evt.pageX - $(this).offset().left;
    var ycoord = evt.pageY - $(this).offset().top;
    var blockVar = GAMEBLOCKS[$(this).attr("id")];
    // console.log("x: " + xcoord + " -- y: " + ycoord);
    var xscale = 1;
    var yscale = 1;
    if (range(51, 100, xcoord)) {
        xscale = 3;
    } else if (range(101, 165, xcoord)) {
        xscale = 5;
    }
    if (range(51, 100, ycoord)) {
        yscale = 3;
    } else if (range(101, 165, ycoord)) {
        yscale = 5;
    }
    refreshBlock(blockVar[0], blockVar[1]);
    blockVar[1].globalAlpha = 0.5;
    
    // If position is marked... dont hightlight
    if(board[blockVar[2]][SCALETOINDEX[xscale][yscale]] == ".")
        drawCircle(blockVar[1], CTRSCALE * xscale, CTRSCALE * yscale, PLAYERHILIGHT);
};

var rotateFn = function(evt) {
    $(".arrows").css("visibility", "hidden").unbind();
    var blockR = $(this).attr("id");
    board = rotateBlock(board, Number(blockR[0]), blockR[1]);
    refreshBoard();
    playerTurn = false;
    isGameOver = gameOver(board, playerToken, AI, "You", "AI");
    if(!isGameOver) {
        aiMsgBox = $("#AIMsg");
        aiMsgBox.val(aiMsgBox.val() + "Turn " + (++turnCount) + "\n");
        aiMsgBox.val(aiMsgBox.val() + "AI is thinking...\n");
    }
    $(function() {
        gameControl();
    });

};

var markMarbleFn = function(evt) {
    if(playerTurn) {
        var xcoord = evt.pageX - $(this).offset().left;
        var ycoord = evt.pageY - $(this).offset().top;
        var blockVar = GAMEBLOCKS[$(this).attr("id")];
        var xscale = 1;
        var yscale = 1;
        if (range(51, 100, xcoord)) {
            xscale = 3;
        } else if (range(101, 165, xcoord)) {
            xscale = 5;
        }
        if (range(51, 100, ycoord)) {
            yscale = 3;
        } else if (range(101, 165, ycoord)) {
            yscale = 5;
        }
        index = SCALETOINDEX[xscale][yscale]
        if(board[blockVar[2]][index]== "."){
            board[blockVar[2]][index] = playerToken;
            drawCircle(blockVar[1], CTRSCALE * xscale, CTRSCALE * yscale, PLAYERCOLOR);
            isGameOver = gameOver(board, playerToken, AI, "You", "AI");
            // Remove user ability to click on other positions of board
            $("#gameBoard canvas").unbind()
            // Bring rotation arrows out
            // $(".arrows").toggle();
            $(".arrows").css("visibility", "visible");
            // Wait for user to choose direction
            if(!isGameOver) {
                $(".arrows").click(rotateFn);
            }
        }
    }
};

$("#newGame").click(function() {
    $("#newGameConfirm").css("visibility", "visible");
    $("#newGameCancel").css("visibility", "visible");
});

$("#newGameConfirm").click(function() {
    $("#newGameConfirm").css("visibility", "hidden");
    $("#newGameCancel").css("visibility", "hidden");

    board = resetBoard();
    initGameBoards();
    isGameOver = false;
    playerTurn = true;
    randomMove = true;
    turnCount = 0;
    $("#AIMsg").val("").toggle();

    gameBoard = $("#gameBoard canvas")
    gameBoard.css("cursor", "pointer");
    gameBoard.unbind();
    gameBoard.click(markMarbleFn);
    gameBoard.mousemove(highlightFn);
    gameBoard.mouseleave(function() {
        var blockVar = GAMEBLOCKS[$(this).attr("id")];
        refreshBlock(blockVar[0], blockVar[1]);
    });
    gameControl();
});

$("#newGameCancel").click(function() {
    $("#newGameConfirm").css("visibility", "hidden");
    $("#newGameCancel").css("visibility", "hidden");
});

$("#instrLink").click(function () {
    $("#gameBoard").hide();
    $("#controls").hide();
    $("#instrContainer").css("display", "inline");
    $("#aiContainer").css("display", "none");

});

$("#playLink").click(function () {
    $("#instrContainer").css("display", "none")
    $("#aiContainer").css("display", "none");
    $("#gameBoard").show();
    $("#controls").show();
});

$("#aiLink").click(function () {
    $("#instrContainer").css("display", "none");
    $("#gameBoard").hide();
    $("#controls").hide();
    $("#aiContainer").css("display", "inline");
});

// ---------------- Utility Functions ----------------

function range(start, end, value) {
    if (value >= start && value <= end)
        return true;
    return false;
}

function resetBoard() {
    var newBoard = {0: []};
    for(var i = 1; i <= NUM_BLOCKS; i++) {
        newBoard[i] = new Array(BLOCK_SIZE).fill(".");
    }
    return newBoard;
}

function refreshBoard() {
    for(key in GAMEBLOCKS) {
        refreshBlock(GAMEBLOCKS[key][0], GAMEBLOCKS[key][1])
    }
}

// ---------------- UI Functions ----------------

// Draws basic layout of game boards
function initGameBoards() {
    // $(".arrows").hide();
    $(".arrows").css("visibility", "hidden");
    $("#AIMsg").hide();
    for (blockID in GAMEBLOCKS) {
        drawBlock(GAMEBLOCKS[blockID][0], GAMEBLOCKS[blockID][1]);
        refreshBlock(GAMEBLOCKS[blockID][0], GAMEBLOCKS[blockID][1]);
    }
}

function drawBlock(block, context) {
    var stepX = block.width / 3;
    var stepY = block.height / 3;

    context.beginPath();
    // Draw vertical lines
    for (var y = stepX; y < block.width; y += stepX) {
        context.moveTo(0, y);
        context.lineTo(block.height, y);
        context.stroke();
    }
    // Draw horizontal lines
    for (var x = stepY; x < block.height; x += stepY) {
        context.moveTo(x, 0);
        context.lineTo(x, block.width);
        context.stroke();
    }
}

function blockMarkers(blockCtx, blockNum) {
    blockCtx.font = "30px Arial";
    blockCtx.fillStyle = MARKERCOLOR;
    blockCtx.fillText(blockNum,  GAMEBLOCKS[blockID][0].width/2 - 8, GAMEBLOCKS[blockID][0].height/2 + 10);
}

// Removes all drawings from the given block and its context
function refreshBlock(block, context) {
    context.globalAlpha = 1.0;
    context.clearRect(0, 0, block.width, block.height);
    drawBlock(block, context);
    var updateBlock = GAMEBLOCKS[block.id][2];

    for(var i = 0, xscale = 1, yscale = 1; i < BLOCK_SIZE; i++, xscale += 2) {
        if(xscale > 5) {
            xscale = 1;
            yscale += 2
        }
        if (board[updateBlock][i] == "w") {
            drawCircle(context, CTRSCALE * xscale, CTRSCALE * yscale, PLAYERCOLOR);
        } else if (board[updateBlock][i] == "b") {
            drawCircle(context, CTRSCALE * xscale, CTRSCALE * yscale, AICOLOR);
        }
    }
    blockMarkers(context, updateBlock);
}

// Draws a circle at the given X, Y coordinates
function drawCircle(context, centerX, centerY, color) {
    context.beginPath();
    context.arc(centerX, centerY, MARKERSIZE + 2, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}


// ---------------- Pentago Logic Functions ----------------

//  Rotates the given block clockwise
function rotateRight(board, block) {
    copyBoard = $.extend(true, {}, board)
    selfBlock = board[block];
    copyBlock = copyBoard[block];

    indexOne = 6;
    indexTwo = 3;
    indexThree = 0;
    indexCount = 1;
    for(var i = 0; i < BLOCK_SIZE; i++) {
        if(indexCount == 1) {
            copyBlock[i] = selfBlock[indexOne];
            indexOne += 1;
            indexCount += 1;
        } else if(indexCount == 2) {
            copyBlock[i] = selfBlock[indexTwo];
            indexTwo += 1;
            indexCount += 1;
        } else {
            copyBlock[i] = selfBlock[indexThree];
            indexThree += 1;
            indexCount = 1;
        }
    }
    return copyBoard;

}

//  Rotates the given block clockwise
function rotateLeft(board, block) {
    copyBoard = $.extend(true, {}, board);
    selfBlock = board[block];
    copyBlock = copyBoard[block];

    indexOne = 2;
    indexTwo = 5;
    indexThree = 8;
    indexCount = 1;
    for(var i = 0; i < BLOCK_SIZE; i++) {
        if(indexCount == 1) {
            copyBlock[i] = selfBlock[indexOne];
            indexOne -= 1;
            indexCount += 1;
        } else if(indexCount == 2) {
            copyBlock[i] = selfBlock[indexTwo];
            indexTwo -= 1;
            indexCount += 1;
        } else {
            copyBlock[i] = selfBlock[indexThree];
            indexThree -= 1;
            indexCount = 1;
        }
    }
    return copyBoard;

}

//  Places a "marble" at given block and position
//  Assumes block and position are valid
function placeMarble(board, block, position, player) {
    temp = $.extend(true, {}, board);
    temp[block][position] = player;
    return temp;
}

// Rotates the board given the block and direction to rotate
// Assumes block and direction are valid
// Rotates block right by default
function rotateBlock(board, block, direction) {
    temp = {};
    if(direction == "l")
        temp = rotateLeft(board, block);
    else
        temp = rotateRight(board, block);
    return temp;
}

// Checks the given move if it is valid
function isValidMove(board, block, position) {
    if(board[block][position] == ".")
        return true;
    return false;
}

// Checks the board for the given player if any goal state is reached
function isGoalReached(board, player){
    goalFound = false;
    for(goalState in GOAL_STATES) {
        if(goalFound)
            break;
        else {
            isGoal = true;
            for(block in GOAL_STATES[goalState]) {
                for(position in GOAL_STATES[goalState][block]) {
                    index = GOAL_STATES[goalState][block][position];
                    isGoal = isGoal && (board[block][index] == player);
                }
            }
            if(isGoal)
                goalFound = true
        }
    }
    return goalFound;
}

// Returns true if a goal state has been reached, false otherwise
function gameOver(board, playerToken, AIToken, playerName, AIName) {
    game = false
    playerGoal = isGoalReached(board, playerToken)
    AIGoal = isGoalReached(board, AIToken)
    if(playerGoal || AIGoal){
        AIMsg = $("#AIMsg")
        if(playerGoal && AIGoal) {
            AIMsg.val(AIMsg.val() + "This game ends in a tie!");
        } else if(playerGoal) {
            AIMsg.val(AIMsg.val() + playerName + " win this game!")
        } else if(AIGoal)
            AIMsg.val(AIMsg.val() + AIName + " wins this game!")
        game = true
    }
    return game
}

// Returns number of row, column, diagonal goals available
// for given player
//           -- given player win == +inf
//           -- given player's opponent win == -inf
//           -- ties (both win or no moves left) = 0
function utility(board, player) {
    goalStates = $.extend(true, [], GOAL_STATES);
    playerGoal = false;
    opponentGoal = false;
    removeStates = [];
    opponent = (player == "b") ? "w" : "b";
    
    //  Traverse through goal states
    for(state in goalStates) {
        pGoal = true // tracks this goal for player
        oGoal = true // tracks this goal for opponent
        goalOpen = true // tracks the availability of goal state
        for(block in goalStates[state]) {
            for(position in goalStates[state][block]) {
                pGoal = pGoal && (board[block][position] == player)
                oGoal = oGoal && (board[block][position] == opponent)
                goalOpen = goalOpen && (board[block][position] == ".")
            }
        }
        if(pGoal)
            playerGoal = true
        if(oGoal)
            opponentGoal = true
        if(!goalOpen)
            removeStates.push(state)
    }

    for(i = removeStates.length - 1; i >= 0; i--) {
        goalStates.splice(i, 1);
    }

    if(playerGoal && opponentGoal)
        util = 0
    else if(playerGoal)
        util = POSITIVE_LIMIT;
    else if(opponentGoal)
        util = NEGATIVE_LIMIT;
    else
        util = goalStates.length
    return util
}  

// Minimax search with alpha beta pruning
function miniMaxAB(board, curDepth, targetDepth, getMax, player, alpha, beta, moveList) {
    if(curDepth == targetDepth) {
        return [moveList, utility(board, player)]
    }
    if(getMax) {
        bestValue = [[], NEGATIVE_LIMIT]
        // Get all possible neighbors of current board
        for(b in BLOCKS){
            for(b2 in BLOCKS) {
                for(pos in INDICES) {
                    directions = ["l", "r"];
                    valid = isValidMove(board, BLOCKS[b], pos);
                    if(valid)
                        nextBoard = placeMarble(board, BLOCKS[b], pos, player)
                    for(dir in directions) {
                        if(valid) {
                            nextBoardRotated = rotateBlock(nextBoard, BLOCKS[b2], directions[dir])
                            move = BLOCKS[b] + pos + BLOCKS[b2] + directions[dir];
                            // firstMove = "%s/%s %s%s" %(b, pos, b2, dir)
                            value = miniMaxAB(nextBoardRotated, curDepth + 1, targetDepth, false, player, alpha, beta, moveList.concat(move))
                            bestValue =  (bestValue[1] > value[1]) ?  bestValue : value; //max(bestValue, value)
                            alpha = (bestValue[1] > alpha[1]) ?  bestValue : alpha; // max(alpha, bestValue)
                            if(beta[1] < alpha[1]) 
                                break
                                
                        }
                    }
                }
            }
        }
    } else {
        bestValue = [[], POSITIVE_LIMIT]
        // Get all possible neighbors of current board
        for(b in BLOCKS) {
            for(b2 in BLOCKS) {
                for(pos in INDICES) {
                    directions = ["l", "r"];
                    valid = isValidMove(board, BLOCKS[b], pos);
                    if(valid)
                        nextBoard = placeMarble(board, BLOCKS[b], pos, player)
                    for(dir in directions) {
                        if(valid) {
                            nextBoardRotated = rotateBlock(nextBoard, BLOCKS[b2], directions[dir])
                            move = BLOCKS[b] + pos + BLOCKS[b2] + directions[dir];
                            //     firstMove = "%s/%s %s%s" %(b, pos, b2, dir)
                            value = miniMaxAB(nextBoardRotated, curDepth + 1, targetDepth, true, player, alpha, beta, moveList.concat(move))
                            bestValue = (bestValue[1] < value[1]) ? bestValue : value; //min(bestValue, value)
                            beta = (bestValue[1] < beta[1]) ? bestValue : beta //min(beta, bestValue)
                            if(beta[1] < alpha[1]) 
                                break
                            
                        }
                    }
                }
            }
        }
    }
    return bestValue
}

function gameControl() {
    if(!isGameOver){
        if(!playerTurn) { // AI turn
            AITurn();
            if(!isGameOver) {
                playerTurn = true;
                $("#gameBoard canvas").click(markMarbleFn);
                $("#gameBoard canvas").mousemove(highlightFn);
                $("#gameBoard canvas").mouseleave(function() {
                    var blockVar = GAMEBLOCKS[$(this).attr("id")];
                    refreshBlock(blockVar[0], blockVar[1]);
                });
            }
        }
    } else {
        playerTurn = false;
    }
}

function AITurn() {
    AITextArea = $("#AIMsg")
    alpha = [[], NEGATIVE_LIMIT]
    beta = [[], POSITIVE_LIMIT]
    if(randomMove) {
        randomMove = false;
        randBlock = Math.floor(Math.random() * NUM_BLOCKS) + 1;
        randIndex = Math.floor(Math.random() * BLOCK_SIZE);
        while(!isValidMove(board, randBlock, randIndex)) {
            randBlock = Math.floor(Math.random() * NUM_BLOCKS) + 1;
            randIndex = Math.floor(Math.random() * BLOCK_SIZE);
        }
        randRotateBlock = Math.floor(Math.random() * NUM_BLOCKS) + 1;
        randRotateDir = (Math.floor(Math.random() * 2) == 1) ? "r" : "l";
        move = "" + randBlock + randIndex + randRotateBlock + randRotateDir;
    } else {
        move = miniMaxAB(board, 0, 2, true, AI, alpha, beta, []);
        move = isValidMove(board, move[0][1][0], move[0][1][1]) ? move[0][1] : move[0][0];
    }
    AITextArea.val(AITextArea.val() + "Placed on block " + move[0] + " at position " + (Number(move[1]) + 1) + "\n");
    direction = (move[3] == "l") ? "left" : "right";
    AITextArea.val(AITextArea.val() + "Rotated block " + move[2] + " to the " + direction + "\n\n");
    AITextArea.scrollTop(AITextArea[0].scrollHeight);
    board = placeMarble(board, Number(move[0]), Number(move[1]), AI);
    refreshBoard();
    isGameOver = gameOver(board, playerToken, AI, "You", "AI")
    board = rotateBlock(board, Number(move[2]), move[3])
    refreshBoard();
    if(!isGameOver)
        isGameOver = gameOver(board, playerToken, AI, "You", "AI")
}

