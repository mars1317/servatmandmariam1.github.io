$(document).ready(function(){
    $("#results-section").hide();
    $("#hungarian-form").submit(function(event){
        var matrix = getFormatedMatrix($("#txtMatrix").val());
        getHungarianResult(matrix);
        $("#results-section").show();
        event.preventDefault();
    });


});

function getHungarianResult(matrix){
    console.log('matrimx', matrix, typeof(matrix))
    var assignments, assignmentsSeen, results, i, j;
    matrix = JSON.parse("[" +  matrix + "]");
    assignments = hungarian(matrix);
    resultsHTML = "<b>Матриця мінімальних витрат:</b>"
    resultsHTML += "<table class='table'>";
    assignmentsSeen = 0;
    for(i=0; i<matrix.length; i++) {
        resultsHTML += "<tr>";
        for(j=0; j<matrix[0].length; j++) {
            if(assignmentsSeen < assignments.length && assignments[assignmentsSeen][0] === i && assignments[assignmentsSeen][1] === j) {
                assignmentsSeen++;
                resultsHTML += "<td style=\"background-color: #FFCC99; text-align: right;\">";
            } else {
                resultsHTML += "<td style=\"text-align: right;\">";
            }
            resultsHTML += matrix[i][j];
            resultsHTML += "</td>";
        }
        resultsHTML += "</tr>";
    }
    resultsHTML += "</table><br />\n";

    resultsHTML += "<b>Результат:</b> ";
    resultsHTML += hungarian(matrix, false, true);
    resultsHTML += "<br /><br /><br />";

    assignments = hungarian(matrix, true);
    resultsHTML += "<b>Матриця максимальних витрат:</b>"
    resultsHTML += "<table class='table'>";
    assignmentsSeen = 0;
    for(i=0; i<matrix.length; i++) {
        resultsHTML += "<tr>";
        for(j=0; j<matrix[0].length; j++) {
            if(assignmentsSeen < assignments.length && assignments[assignmentsSeen][0] === i && assignments[assignmentsSeen][1] === j) {
                assignmentsSeen++;
                resultsHTML += "<td style=\"background-color: #99CCFF; text-align: right;\">";
            } else {
                resultsHTML += "<td style=\"text-align: right;\">";
            }
            resultsHTML += matrix[i][j];
            resultsHTML += "</td>";
        }
        resultsHTML += "</tr>";
    }
    resultsHTML += "</table><br />\n";

    resultsHTML += "<b>Результат:</b> ";
      resultsHTML += hungarian(matrix, true, true);
    resultsHTML += "<br />";
    document.getElementById("results").innerHTML = resultsHTML;
}

function getFormatedMatrix(insertedMatrix){
    insertedMatrix = insertedMatrix.replace(/(\r\n|\n|\r)/gm,"");
    return insertedMatrix;
}