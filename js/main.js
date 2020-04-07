
(function(global) {
  global.hungarian = hgAlgorithm;
  function hgAlgorithm(matrix, isProfitMatrix, returnSum) {
    var cost, i, j,
        mask = [],
        rowCover = [],
        colCover = [], 
        zero_RC = [0,0],
        path = [], 
        step = 1,
        done = false,
        maxWeightPlusOne,
        assignments = [],
        assignmentsSeen;

  
    cost = copyOf(matrix);

    maxWeightPlusOne = findLargest(cost) + 1;

   
    makeSquare(cost, maxWeightPlusOne);

    if(isProfitMatrix === true) {
      for(i=0; i<cost.length; i++) {
        for(j=0; j<cost[i].length; j++) {
          cost[i][j] = maxWeightPlusOne - cost[i][j];
        }
      }
    }

    for(i=0; i<cost.length; i++) {
      rowCover[i] = 0;
    }
    for(j=0; j<cost[0].length; j++) {
      colCover[j] = 0;
    }

    for(i=0; i<cost.length; i++) {
      mask[i] = [];
      for(j=0; j<cost[0].length; j++) {
        mask[i][j] = 0;
      }
    }
    for(i=0; i<Math.min(matrix.length, matrix[0].length); i++) {
      assignments[i] = [0,0];
    }
    for(i=0; i<(cost.length * cost[0].length + 2); i++) {
      path[i] = [];
    }

    while(!done) {
      switch(step) {
        case 1:
          step = hg_step1(step, cost);
          break;
        case 2:
          step = hg_step2(step, cost, mask, rowCover, colCover);
          break;
        case 3:
          step = hg_step3(step, mask, colCover);
          break;
        case 4:
          step = hg_step4(step, cost, mask, rowCover, colCover, zero_RC);
          break;
        case 5:
          step = hg_step5(step, mask, rowCover, colCover, zero_RC, path);
          break;
        case 6:
          step = hg_step6(step, cost, rowCover, colCover);
          break;
        case 7:
          done = true;
          break;
      }
    }

    assignmentsSeen = 0;
    for(i=0; i<mask.length; i++) {
      for(j=0; j<mask[i].length; j++) {
        if(i < matrix.length && j < matrix[0].length && mask[i][j] === 1) {
          assignments[assignmentsSeen][0] = i;
          assignments[assignmentsSeen][1] = j;
          assignmentsSeen++;
        }
      }
    }

    if(returnSum === true) {

      var sum = 0;
      for(i=0; i<assignments.length; i++) {
        sum = sum + matrix[assignments[i][0]][assignments[i][1]];
      }
      return sum;
    } else {
      return assignments;
    }
  }

  function hg_step1(step, cost) {
    var minVal, i,  j;

    for(i=0; i<cost.length; i++) {
      minVal = cost[i][0];
      for(j=0; j<cost[i].length; j++) {
        if(minVal > cost[i][j]) {
          minVal = cost[i][j];
        }
      }
      for(j=0; j<cost[i].length; j++) {
        cost[i][j] -= minVal;
      }
    }

    step = 2;
    return step;
  }

  function hg_step2(step, cost, mask, rowCover, colCover) {

    var i, j;

    for(i=0; i<cost.length; i++) {
      for(j=0; j<cost[i].length; j++) {
        if(cost[i][j] === 0 && colCover[j] === 0 && rowCover[i] === 0) {
          mask[i][j] = 1;
          colCover[j] = 1;
          rowCover[i] = 1;
        }
      }
    }
    clearCovers(rowCover, colCover);

    step = 3;
    return step;
  }

  function hg_step3(step, mask, colCover) {
    var i, j, count;
    for(i=0; i<mask.length; i++) {
      for(j=0; j<mask[i].length; j++) {
        if(mask[i][j] === 1) {
          colCover[j] = 1;
        }
      }
    }
    count = 0;
    for(j=0; j<colCover.length; j++) {
      count += colCover[j];
    }

    if(count >= mask.length) {
      step = 7;
    } else {
      step = 4;
    }

    return step;
  }

  function hg_step4(step, cost, mask, rowCover, colCover, zero_RC) {

    var row_col = [0,0],
        done = false,
        j, starInRow;

    while(!done) {
      row_col = findUncoveredZero(row_col, cost, rowCover, colCover);
      if(row_col[0] === -1) {
        done = true;
        step = 6;
      } else {
        mask[row_col[0]][row_col[1]] = 2;

        starInRow = false;
        for(j=0; j<mask[row_col[0]].length; j++) {
          if(mask[row_col[0]][j] === 1) {
            starInRow = true;
            row_col[1] = j;
          }
        }

        if(starInRow) {
          rowCover[row_col[0]] = 1; 
          colCover[row_col[1]] = 0; 
        } else {
          zero_RC[0] = row_col[0]; 
          zero_RC[1] = row_col[1]; 
          done = true;
          step = 5;
        }
      }
    }

    return step;
  }

  function findUncoveredZero(row_col, cost, rowCover, colCover) {
    var i, j, done;

    row_col[0] = -1; 
    row_col[1] = 0;

    i = 0;
    done = false;

    while(!done) {
      j = 0;
      while(j < cost[i].length) {
        if(cost[i][j] === 0 && rowCover[i] === 0 && colCover[j] === 0) {
          row_col[0] = i;
          row_col[1] = j;
          done = true;
        }
        j = j+1;
      }
      i++;
      if(i >= cost.length) {
        done = true;
      }
    }

    return row_col;
  }

  function hg_step5(step, mask, rowCover, colCover, zero_RC, path) {
    var count, done, r, c;

    count = 0;
    path[count][0] = zero_RC[0]; 
    path[count][1] = zero_RC[1];

    done = false;
    while(!done) {
      r = findStarInCol(mask, path[count][1]);
      if(r >= 0) {
        count = count+1;
        path[count][0] = r; 
        path[count][1] = path[count-1][1]; 
      } else {
        done = true;
      }

      if(!done) {
        c = findPrimeInRow(mask, path[count][0]);
        count = count+1;
        path[count][0] = path[count-1][0]; 
        path[count][1] = c;
      }
    }

    convertPath(mask, path, count);
    clearCovers(rowCover, colCover);
    erasePrimes(mask);

    step = 3;
    return step;
  }

  function findStarInCol(mask, col) {
    var r, i;
    r = -1;
    for(i=0; i<mask.length; i++) {
      if(mask[i][col] === 1) {
        r = i;
      }
    }
    return r;
  }
  function findPrimeInRow(mask, row) {
    var c, j;

    c = -1;
    for(j=0; j<mask[row].length; j++) {
      if(mask[row][j] === 2) {
        c = j;
      }
    }

    return c;
  }

  function convertPath(mask, path, count) {
    var i;

    for(i=0; i<=count; i++) {
      if (mask[path[i][0]][path[i][1]] === 1) {
        mask[path[i][0]][path[i][1]] = 0;
      } else {
        mask[path[i][0]][path[i][1]] = 1;
      }
    }
  }

  function erasePrimes(mask) {
    var i, j;

    for(i=0; i<mask.length; i++) {
      for(j=0; j<mask[i].length; j++) {
        if(mask[i][j] === 2) {
          mask[i][j] = 0;
        }
      }
    }
  }

  function clearCovers(rowCover, colCover) {
    var i, j;

    for(i=0; i<rowCover.length; i++) {
      rowCover[i] = 0;
    }
    for(j=0; j<colCover.length; j++) {
      colCover[j] = 0;
    }
  }

  function hg_step6(step, cost, rowCover, colCover) {

    var minVal, i, j;

    minVal = findSmallest(cost, rowCover, colCover);

    for(i=0; i<rowCover.length; i++) {
      for(j=0; j<colCover.length; j++) {
        if(rowCover[i] === 1) {
          cost[i][j] += minVal;
        }
        if(colCover[j] === 0) {
          cost[i][j] -= minVal;
        }
      }
    }

    step = 4;
    return step;
  }

  function findSmallest(cost, rowCover, colCover) {
    var minVal, i, j;
    minVal = Number.MAX_VALUE;
    for(i=0; i<cost.length; i++) {
      for(j=0; j<cost[i].length; j++) {
        if(rowCover[i] === 0 && colCover[j] === 0 && minVal > cost[i][j]) {
          minVal = cost[i][j];
        }
      }
    }

    return minVal;
  }

  function findLargest(matrix) {
    var i, j, largest = Number.MIN_VALUE;
    for(i=0; i<matrix.length; i++) {
      for(j=0; j<matrix[i].length; j++) {
        if(matrix[i][j] > largest) {
          largest = matrix[i][j];
        }
      }
    }
    return largest;
  }

  function copyOf(original) {
    var i, j,
    copy = [];

    for(i=0; i<original.length; i++) {
      copy[i] = [];
      for(j=0; j<original[i].length; j++) {
        copy[i][j] = original[i][j];
      }
    }

    return copy;
  }

  function makeSquare(matrix, padValue) {
    var rows = matrix.length,
    cols = matrix[0].length,
    i, j;

    if(rows === cols) {
      return;
    } else if(rows > cols) {
      for(i=0; i<rows; i++) {
        for(j=cols; j<rows; j++) {
          matrix[i][j] = padValue;
        }
      }
    } else if(rows < cols) {
      for(i=rows; i<cols; i++) {
        matrix[i] = [];
        for(j=0; j<cols; j++) {
          matrix[i][j] = padValue;
        }
      }
    }
  }

})(this);
