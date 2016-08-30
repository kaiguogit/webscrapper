const request = require('request');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const fs = require('fs');;
const fields = ['File Permission', 'Absolute URL', 'File Type'];

request('http://substack.net/images/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    // console.log(body) // Show the HTML for the Google homepage.
    var $ = cheerio.load(body);
    scrap($);
  }
})

function scrap($){
  var result = [];
  var rows = $('tr');
  rows.each((i,row) => {
    //skip directory
    var name = $(row).find("td:nth-of-type(3)").text();
    var isDirectory = (/\/$/).test(name);
    if (isDirectory) return;

    //save row data into hash
    var rowData = {};
    var permission = $(row).find("td:nth-of-type(1)").text();
    var url = "http://substack.net" + $(row).find("td:nth-of-type(3) > a").attr("href");
    var fileType = $(row).find("td:nth-of-type(3)").text().split(".")[1];
    rowData[fields[0]] = permission;
    rowData[fields[1]] = url;
    rowData[fields[2]] = fileType;
    result.push(rowData);
  });

  saveCSV(result);
}

function saveCSV(data){
  try {
    var csv = json2csv({ data: data, fields: fields });
    fs.writeFile('file.csv', csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });
  } catch (err) {
    // Errors are thrown for bad options, or if the data is empty and no fields are provided. 
    // Be sure to provide fields if it is possible that your data array will be empty. 
    console.error(err);
  }
}

