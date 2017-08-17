/*
* Decleration of Global Variables
*/
var $puppy = null;
var numOfColumns = null;
var numOfRows = null;
var banjo = null;
var commandArea = null;
/*
* Document Ready Function
*/
$(document).ready(function() {
    banjo = new Puppy('Banjo');
    commandArea = new CommandArea();
    $puppy = $('#puppy');
    numOfColumns = $('.game_area').css('grid-template-columns').split(' ').length;
    numOfRows = $('.game_area').css('grid-template-rows').split(' ').length;
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//The PUPPY OBJECT is the main item the player will be interacting with. The Puppy holds its own name as ///
//well as all of the methods involved with interpreting commands and executing its own movement.////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Puppy = function(puppyName) {
    this.getName = puppyName;
    /**
    * This method determines if the proposed new grid location is valid. If it is, it will move the puppy there.
    * If it is not, it will add to the unfulfilledCommands variable
    */
    this.checkIfClear_thenMove = function (row, column, newLocation, transformDir) {
        $puppy.css('transition','all .25s');
        var currentAngle = parseInt($puppy.attr('angle'));
        for (var i = 1; i <= $('.game_area').children().length; i++) {
            if (row < 1 || column < 1 || row > numOfRows || column > numOfColumns) {
                console.log('edge of map');
                commandArea.updateUnfulfilledCommands();
                return false;
            }
            if ($('.game_area div:nth-child(' + i + ')').css('grid-area') === row + " / " + column + " / auto / auto") {
                console.log("can't move here");
                commandArea.updateUnfulfilledCommands();
                return false;
            }
        }
        $puppy.css('transform',  'rotate(' + currentAngle + 'deg)' + transformDir);
        setTimeout(function(){
            $puppy.css('transition', 'none');
            $puppy.css('grid-area', newLocation);
            $puppy.css('transform',  'rotate(' + currentAngle + 'deg)');
        }, 250);
    };

    /**
    * This method determines the puppy DOM's current grid location, determines the new grid location
    * based on the arguments and then calls the "checkIfClear_thenMove" method to verify that location is valid
    */
    this.move = function(directionMoving, directionFacing) {
        var currentPosition = $puppy.css('grid-area'); //Determine the current grid position of the puppy
        var movementArray = { //A matrix to determine which way to animate the puppy movement wth transform, relative to his current rotation
            'facingUp': ["translateY(-100%)", "translateX(100%)", "translateY(100%)", "translateX(-100%)"],
            'facingDown': ["translateY(100%)", "translateX(-100%)", "translateY(-100%)", "translateX(100%)"],
            'facingRight': ["translateX(-100%)", "translateY(-100%)", "translateX(100%)", "translateY(100%)"],
            'facingLeft': ["translateX(100%)", "translateY(100%)", "translateX(-100%)", "translateY(-100%)"]
        };
        var row = parseInt(currentPosition.substring(0, 1));
        var column = parseInt(currentPosition.substring(4, 5));
        var transformDir = null;
        var newLocation = null;
        switch (directionMoving) {
            //This switch statement determines the change in row or column for the puppies new position and chooses the correct transform translate
            case 'up':
                row -= 1;
                transformDir = movementArray[directionFacing][0];
                break;
            case 'down':
                row += 1;
                transformDir = movementArray[directionFacing][2];
                break;
            case 'left':
                column -= 1;
                transformDir = movementArray[directionFacing][3];
                break;
            case 'right':
                column += 1;
                transformDir = movementArray[directionFacing][1];
                break;
        }
        newLocation = row + " / " + column;
        this.checkIfClear_thenMove(row, column, newLocation, transformDir);
    };

    /**
    * This method looks at the movement command given, determines what direction to move based on current rotation, and then calls the "move" Method
    */
    this.commandDirection = function(commandDir) {
        var movementArray = {
            'moveForward': ['up', 'right', 'down', 'left'],
            'moveBackward': ['down', 'left', 'up', 'right'],
            'rollLeft': ['left', 'up', 'right', 'down'],
            'rollRight': ['right', 'down', 'left', 'up']
        };
        var currentAngle = $puppy.attr('angle');
        if (currentAngle % 360 === 0) {
            this.move(movementArray[commandDir][0], 'facingUp');
        }
        else if (currentAngle % 180 === 0) {
            this.move(movementArray[commandDir][2], 'facingDown');
        } else if (currentAngle % 270 === 0) {
            if (currentAngle > 0) {
                this.move(movementArray[commandDir][3], 'facingLeft');
            } else {
                this.move(movementArray[commandDir][1], 'facingRight');
            }
        } else if (currentAngle > 0) {
            this.move(movementArray[commandDir][1], 'facingRight');
        } else {
            this.move(movementArray[commandDir][3], 'facingLeft');
        }
    };

    /**
    * This method rotates the puppy 90 degrees clockwise
    */
    this.turnRight = function() {
        $puppy.css('transition','all .5s');
        var newAngle = parseInt($puppy.attr('angle')) + 90;
        $puppy.attr('angle', newAngle);
        var rotateAttribute = $puppy.css('transform', 'rotate(' + newAngle + 'deg)');
    };

    //
    //This method rotates the puppy 90 degrees counterclockwise
    //
    this.turnLeft = function() {
        $puppy.css('transition','all .5s');
        var newAngle = parseInt($puppy.attr('angle')) - 90;
        $puppy.attr('angle', newAngle);
        var rotateAttribute = $puppy.css('transform', 'rotate(' + newAngle + 'deg)');
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//The COMMANDAREA OBJECT holds an array of given commands and holds all of the Methods related to //////////
//the player giving commands, clearing commands, and executing commands ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
var CommandArea = function() {
    this.currentCommands = [], // This array holds all of the command objects currently in the command que
    this.unfulfilledCommands = 0, // This counter holds the number of commands which could not be fulfilled
    /**
    * This constructor creates Command objects which hold the value of which command they are
    */
    this.CommandBlueprint = function(buttonClicked) {
        this.commandType = buttonClicked;
    },
    /**
    * This method creates a new Command object, pushes it into the currentCommands array, and calls the
    * displayCommands method, whenever the player clicks on a command button
    */
    this.giveCommands = function(buttonClicked) {
        var newCommand = new commandArea.CommandBlueprint(buttonClicked);
        commandArea.currentCommands.push(newCommand);
        this.displayCommands();
        console.log(commandArea.currentCommands);
    },
    /**
    * This function clears out all of the command DOM elements and repopulates the display based on what
    * is currently in the currentCommands array
    */
    this.displayCommands = function() {
        $('.commandLine').empty();
        var length = this.getCommandLength();
        for (var i = 0; i < length; i++) {
            var newDiv = $('<div>').addClass('commandBox').attr('command', commandArea.currentCommands[i].commandType);
            newDiv.text(commandArea.currentCommands[i].commandType);
            $('.commandLine').append(newDiv);
        }
    },
    /**
    * This method increments the unfulfilledCommands counter and displays the updated value
    */
    this.updateUnfulfilledCommands = function() {
        this.unfulfilledCommands = this.unfulfilledCommands + 1;
        $('.unfulfilledDisplay').text(this.unfulfilledCommands);
    },
    /**
    * This method returns the length of the currentCommands array
    */
    this.getCommandLength = function() {
        return this.currentCommands.length;
    },
    /*
    * This method iterates through all of the commands in the currentCommands array and calls the
    * corresponding method within the puppy array to carry out the command.
    */
    this.executeCommandLine = function(puppyObject) {
        var length = this.getCommandLength();
        var currentPosition = 1;
        var execute = setInterval(executeCommands, 500);
        function executeCommands() {
            var currentDiv = $('.commandLine > div:nth-child(' + currentPosition + ')');
            $('.commandLine > div:nth-child(' + (currentPosition-1) + ')').css('background-position', '0 0');
            currentDiv.css('background-position', '-85px 0');
            switch (currentDiv.attr('command')) {
                case 'Roll Left':
                    puppyObject.commandDirection('rollLeft');
                    break;
                case 'Roll Right':
                    puppyObject.commandDirection('rollRight');
                    break;
                case 'Back':
                    puppyObject.commandDirection('moveBackward');
                    break;
                case 'Forward':
                    puppyObject.commandDirection('moveForward');
                    break;
                case 'Turn Left':
                    puppyObject.turnLeft();
                    break;
                case 'Turn Right':
                    puppyObject.turnRight();
                    break;
            }
            //Increment the current position, check if we're at the end of the CommandQue, if we are, clear the execute interval
            currentPosition++;
            if (currentPosition > length) {
                clearInterval(execute);
                setTimeout(function(){currentDiv.css('background-position', '0 0');}, 1000);
            }
        }
    },
    /**
    * Adds click handlers to the command buttons
    */
    this.addCommandClickHandlers = function() {
        $('.command_area').on('click', 'button', function() {
            switch ($(this).text()) {
                case 'Execute Commands':
                    commandArea.executeCommandLine(banjo);
                    break;
                case 'Clear Commands':
                    commandArea.currentCommands = [];
                    commandArea.displayCommands();
                    break;
                case 'Remove Last Command':
                    commandArea.currentCommands.pop();
                    commandArea.displayCommands();
            }
        });
        $(".giveCommands").on('click', 'button', function () {
            var buttonClicked = $(this).text();
            commandArea.giveCommands(buttonClicked);
        });
    },
    this.addCommandClickHandlers() // Calls that Add Click Handler Method upon the completion of creation
};