// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ",";

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    // Delimiters.
    "(\\" +
      strDelimiter +
      "|\\r?\\n|\\r|^)" +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      strDelimiter +
      "\\r\\n]*))",
    "gi"
  );

  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }

    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return arrData;
}

var xhr = new XMLHttpRequest();
xhr.open("GET", "netvalue.csv", true);
xhr.onload = function (e) {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      draw(xhr.responseText);
    } else {
      console.error(xhr.statusText);
    }
  }
};
xhr.onerror = function (e) {
  console.error(xhr.statusText);
};
xhr.send(null);

function draw(strData) {
  var arrData = CSVToArray(strData);
  var dateFormat = "YYYYMDD";
  var data_hs300 = [];
  var data_netvalue = [];
  for (var i = 1; i < arrData.length; i++) {
    var row = arrData[i];
    var date = moment(row[0], dateFormat);
    data_hs300.push({ t: date, y: row[1] / arrData[1][1] });
    data_netvalue.push({ t: date, y: row[2] });
  }
  var ctx = document.getElementById("netvalue").getContext("2d");

  var cfg = {
    // The type of chart we want to create
    type: "line",

    // The data for our dataset
    data: {
      // labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: "朝闻道基金净值",
          backgroundColor: "salmon",
          borderColor: "crimson",
          data: data_netvalue,
          fill: false,
        },
        {
          label: "沪深300指数",
          backgroundColor: "cyan",
          borderColor: "navy",
          data: data_hs300,
          fill: false,
        },
      ],
    },

    // Configuration options go here
    options: {
      responsive: true,
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              displayFormats: {
                month: "YYYYMMDD",
              },
            },
            distribution: "linear",
            ticks: {
              source: "data",
              autoSkip: true,
              maxRotation: 90,
              minRotation: 90,
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "netvalue",
            },
          },
        ],
      },
    },
  };
  var chart = new Chart(ctx, cfg);
}
