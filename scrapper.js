const request = require('request');
const cheerio = require('cheerio');
const json2csv = require('json2csv');
const fs = require('fs');;
const fields = ['File Permission', 'Absolute URL', 'File Type'];
const fieldObj = {'File Permission': ""
                  , 'Absolute URL': ""
                  , 'File Type': ""};
request('http://substack.net/images/', function (error, response, body) {
  if(error) return console.error(error);
  if (response.statusCode === 200) {
    const $ = cheerio.load(body);
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
    var permission = $(row).find("td:nth-of-type(1)").text();
    var url = "http://substack.net" + $(row).find("td:nth-of-type(3) > a").attr("href");
    var fileType = $(row).find("td:nth-of-type(3)").text().split(".")[1];

    fieldObj['File Permission'] = permission;
    fieldObj['Absolute URL'] = url;
    fieldObj['File Type'] = fileType;

    result.push(fieldObj);
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
    console.error(err);
  }
}
