$(document).ready(function() {
    var appStates = {
        Initial: "state.initial",
        Questioning: "state.questioning",
        SubmittingScore: "state.submittingscore",
        Leaderboard: "state.leaderboard"
    };

    var contElement = $("#content");
    var timrElement = $("#timer");
    var hgscElement = $("#highscores");
    var currState;
    var prevState;
    var score = 0;
    var secondsElapsed = 0;
    var interval;

    var currQuestion = 0;
    var lastSelectedAnswer = "";

    const quizTime = 75;
    const questions = [
        question_1 = {
            textContent: "In the JavaScript, which one of the following is not considered as an error:",
            options: [
                "Syntax error",
                "Missing of semicolons",
                "Division by zero",
                "Missing of Bracket"
            ],
            answer: "Division by zero"
        },

        question_2 = {
            textContent: "The condition in an if / else statement is enclosed within _____.",
            options: [
                "quotes",
                "curly brackets",
                "parentheses",
                "square brackets"
            ],
            answer: "parentheses"
        },

        question_3 = {
            textContent: "Which of the following type of a variable is volatile?",
            options: [
                "Mutable variable",
                "Volatile variable",
                "Dynamic variable",
                "Immutable variable"
            ],
            answer: "Mutable variable"
        },

        question_4 = {
            textContent: "Which of the following variables takes precedence over the others if the names are the same?",
            options: [
                "Global variable",
                "The local element",
                "The two of the above",
                "None of the above"
            ],
            answer: "The local element"
        },

        question_5 = {
            textContent: "When interpreter encounters an empty statements, what it will do:",
            options: [
                "Shows a warning",
                "Prompts to complete the statement",
                "Throws an error",
                "Ignores the statements"
            ],
            answer: "Ignores the statements"
        }
    ];

    init();

    function init() {
        $(timrElement).html(`Timer: ${getFormattedSeconds()}`);
        $(hgscElement).html("View Highscores");
        reset();
        createInitialPage();

        $(hgscElement).on("click", function() {
            clearInterval(interval);
            createLeaderboard();
        });
    }

    function reset() {
        secondsElapsed = 0;
        currQuestion = 0;
    }

    function startTimer() {
        clearInterval(interval);

        interval = setInterval(function() {
            secondsElapsed++;
            $(timrElement).html(`Timer: ${getFormattedSeconds()}`);

            if (secondsElapsed >= quizTime) {
                clearInterval(interval);
                if (secondsElapsed > quizTime)
                    secondsElapsed = quizTime;
                createSubmitPage();
            }
        }, 1000);
    }

    function getFormattedSeconds() {
        return (quizTime - secondsElapsed);
    }

    function createInitialPage() {
        currState = appStates.Initial;
        console.log("App State Transitioning To:", currState);

        $(contElement).empty();

        var header = $("<header><h1>Javacscript Coding Quiz Challenge</h1></header>");
        var paragraph = $("<p>Try to answer the following code-related questions within the time limit. Keep in mind that incorrect answers will penalize your score & time by ten seconds. Have fun!</p>")
        var button = $("<button id=\"start-quiz-btn\" type=\"button\" class=\"btn btn-purple\">Start Quiz!</button>")

        $(contElement).append(header, paragraph, button);

        $("#start-quiz-btn").on("click", function() {
            createNewQuestion();
        });
    }

    function createNewQuestion() {
        if (currQuestion >= questions.length) {
            createSubmitPage();
            return;
        }

        prevState = currState;
        currState = appStates.Questioning;
        console.log("App State Transitioning To:", currState);

        $(contElement).empty();

        var questionObj = questions[currQuestion];
        var header = $(`<h1>${questionObj.textContent}</h1>`);
        var unList = $("<ul>");

        $(questionObj.options).each(function(index, value) {
            var btn = $(`<li><button type="button" class="ques-option btn btn-purple" data-ques-option="${value}">${index + 1}. ${value}</button></li>`);
            $(unList).append(btn);
        });

        $(contElement).append(header, unList);

        if (prevState != appStates.Questioning)
            startTimer();

        $(".ques-option").on("click", function(event) {
            event.preventDefault();
            lastSelectedAnswer = $(this).attr("data-ques-option");
            var isCorrect = lastSelectedAnswer === questionObj.answer;

            if (isCorrect)
                score += 30;
            else if (!isCorrect) {
                secondsElapsed += 10;
            }

            currQuestion++;
            createNewQuestion();

            if (isCorrect)
                displayMessage("Correct! 🤑");
            else
                displayMessage("Wrong! ☹️");
        });

        function displayMessage(message) {
            var newMessage = $(`<div class="fader"><hr><h3>${message}</h3></div>`);
            $("#content").append(newMessage);
        }
    }

    function createSubmitPage() {
        clearInterval(interval);
        $(timrElement).html(`Timer: ${getFormattedSeconds()}`);
        currState = appStates.SubmittingScore;
        console.log("App State Transitioning To:", currState);

        var totalScore = score + (Math.floor(getFormattedSeconds() * .15));

        $(contElement).empty();

        var header = $("<h1>All Done!</h1>");
        var paragraph = $(`<p style="text-align: left">Your final score is ${totalScore}.</p>`);
        var submitField = $("<div class=\"submit-field\">Enter initials: <input id=\"initials\" type=\"text\"> <button id=\"initials-submit\" type=\"button\" class=\"btn btn-purple\">Submit</button></div>");

        $(contElement).append(header, paragraph, submitField);

        $("#initials-submit").on("click", function(event) {
            event.preventDefault();
            // even though the current state is not initial
            // here it is so we can go back to the beginning from the back button in the leadeboard
            currState = appStates.Initial;

            var inputInitials = $("#initials").val();

            if (!inputInitials) {
                alert("You need to provide your initials!!!!");
                return;
            }

            var highscores = localStorage.getItem("highscores");

            if (!highscores)
                highscores = {};
            else
                highscores = JSON.parse(highscores);

            highscores[inputInitials] = totalScore;

            localStorage.setItem("highscores", JSON.stringify(highscores));

            createLeaderboard();
            reset();
        });
    }

    function createLeaderboard() {
        if (currState != appStates.Leaderboard)
            prevState = currState;
        currState = appStates.Leaderboard;
        console.log("App State Transitioning To:", currState);

        $(hgscElement).empty();
        $(timrElement).empty();
        $(contElement).empty();

        var header = $("<h1 style=\"margin-top:0;\">Highscores!</h1>");

        var highscores = localStorage.getItem("highscores");

        $(contElement).append(header);

        if (highscores) {
            var parsedHighscores = JSON.parse(highscores);

            var sortedHighscores = sortHighscores();

            var orderScores = $("<ol id=\"highscore-list\"></ol>");

            var counter = 1;
            $.each(sortedHighscores, function(key, value) {
                var liElement = $(`<li class="highscore">${counter}. ${key} - ${value}</li>`);

                if (counter % 2)
                    liElement.addClass("orchid");
                else
                    liElement.addClass("peach");

                $(orderScores).append(liElement);
                counter++;
            });

            $(contElement).append(orderScores);

            function sortHighscores() {
                items = Object.keys(parsedHighscores).map(function(key) {
                    return [key, parsedHighscores[key]];
                });
                items.sort(function(first, second) {
                    return second[1] - first[1];
                });
                sorted_obj = {}
                $.each(items, function(k, v) {
                    use_key = v[0]
                    use_value = v[1]
                    sorted_obj[use_key] = use_value
                });
                return (sorted_obj);
            }
        }

        var buttons = $("<div style=\"text-align:left\"><button id=\"hs-back\" type=\"button\" class=\"btn btn-purple\">Go Back</button> <button id=\"hs-clear\" type=\"button\" class=\"btn btn-purple\">Clear Highscores</button></div>");

        $(contElement).append(buttons);

        $("#hs-clear").on("click", function(event) {
            event.preventDefault();
            localStorage.removeItem("highscores");
            $("#highscore-list").empty();
        });

        $("#hs-back").on("click", function(event) {
            event.preventDefault();

            switch (prevState) {
                case appStates.Initial:
                    createInitialPage();
                    break;
                case appStates.Questioning:
                    createNewQuestion();
                    break;
                case appStates.SubmittingScore:
                    createSubmitPage();
                    break;
                default:
                    console.log(`state ${prevState} not supported`);
                    break;
            }

            $(timrElement).html(`Timer: ${getFormattedSeconds()}`);
            $(hgscElement).html("View Highscores");
        });
    }
});