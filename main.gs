// declare list for warning message.
let warningMessageList = ['Warning: Number of row passing over \"row_to_read\". Tweak me.',
                          'Warning: Number of row passing over \"row_to_read_history\". Tweak me.'
];
let errorMessageList = ['RowIndexOutOfBoundsError: Number of row reached \"row_to_read\". Tweak me.',
                        'RowIndexOutOfBoundsError: Number of row reached \"row_to_read_history\". Tweak me.',
                        'InvalidApiKeyError: API KEY is null.'
];

// declare variables.
let userId = 1;

function recordTodayWearing() {
  // declare variables for prepare.
let ss,
    sheetName = SHEET_NAME_1ST,
    sheet,
    row_to_read           = 51,
    column_for_id         = 1,
    column_for_category   = 4,
    column_for_warmscore  = 7,
    column_for_wearing    = 9,
    column_for_recommend  = 10,
    joinedListForLog,
    serializedDictForLog;
  ss = SpreadsheetApp.getActive();
  sheet = ss.getSheetByName(sheetName);

  // declare list for get list from GSS.
  let idList               = [],
    idList_formated        = [],
    categoryList           = [],
    categoryList_formated  = [],
    warmscoreList          = [],
    warmscoreList_formated = [],
    wearingList            = [],
    wearingList_formated   = [],
    listOfInTheChest       = [];

  // It's a step for read from "history_wear".
  // memorize number of row to read
  console.time(`SELECT TOP ${row_to_read - 1} id FROM \'${sheetName}\'`);
  idList = sheet.getRange(2, column_for_id, row_to_read - 1, 1).getValues();
  console.timeEnd(`SELECT TOP ${row_to_read - 1} id FROM \'${sheetName}\'`);
  idList_formated = listFormated(idList);
  
  // warning message. If condition is false, nothing to do.
  row_to_read_actual = Number(idList_formated.reduce((a,b)=>Math.max(a,b)));
  row_to_read - row_to_read_actual <= 2 ? console.warn(warningMessageList[0]) : false;
  if(row_to_read_actual >= row_to_read - 1){
    console.error(errorMessageList[0]);
    return false;
  }

  // memorize wardrobes: today's "Wearing"
  console.time(`SELECT TOP ${row_to_read_actual} category FROM \'${sheetName}\' Sheet;`);
  categoryList = sheet.getRange(2, column_for_category, row_to_read_actual, 1).getValues();
  console.timeEnd(`SELECT TOP ${row_to_read_actual} category FROM \'${sheetName}\' Sheet;`);
  categoryList_formated = listFormated(categoryList);

  console.time(`SELECT TOP ${row_to_read_actual} warmscore FROM \'${sheetName}\' Sheet;`);
  warmscoreList = sheet.getRange(2, column_for_warmscore, row_to_read_actual, 1).getValues();
  console.timeEnd(`SELECT TOP ${row_to_read_actual} warmscore FROM \'${sheetName}\' Sheet;`);
  warmscoreList_formated = listFormated(warmscoreList);

  console.time(`SELECT TOP ${row_to_read_actual} wearing_today FROM \'${sheetName}\' Sheet;`);
  wearingList = sheet.getRange(2, column_for_wearing, row_to_read_actual, 1).getValues();
  console.timeEnd(`SELECT TOP ${row_to_read_actual} wearing_today FROM \'${sheetName}\' Sheet;`);
  wearingList_formated = listFormated(wearingList);

  // reset "Wearing" to "InTheChest"
  for (let i = 1; i <= row_to_read_actual; i++){
    listOfInTheChest.push([STATUS_IN_THE_CHEST]);
  }
  console.time(`UPDATE \'${sheetName}\'Sheet SET \'wearing_today\' = \'InTheChest\';`);
  sheet.getRange(2, column_for_wearing, row_to_read_actual, 1).setValues(listOfInTheChest);
  console.timeEnd(`UPDATE \'${sheetName}\'Sheet SET \'wearing_today\' = \'InTheChest\';`);

  // It's a step for read from "master_all".
  // declare list for write to GSS.
  let sourceListForWrite = [];

  // write new record to \"history_wear\" sheet unless "Wearing" record is nothing.
  if (!wearingList_formated.includes(STATUS_WEARING)) {
    console.info('INFO: Nothing written record to \"history_wear\" sheet because \"Wearing\" record is nothing today.');
    return false;
  }

  // setting list from master sheet.
  let categoryListHeader        = [],
    categoryListMaster          = [],
    categoryListMaster_formated = [],
    coatListMaster    = [],
    topsListMaster    = [],
    innerListMaster   = [],
    bottomsListMaster = [],
    spatsListMaster   = [],
    coatList    = [],
    topsList    = [],
    innerList   = [],
    bottomsList = [],
    spatsList   = [];
  let sheetNameMaster = SHEET_NAME_MASTER_ALL,
    column_for_category_header = 1,
    column_for_category_master = 2,
    categoryNumber = 0,
    categorySum;

  // get category master from GSS.
  sheet = ss.getSheetByName(sheetNameMaster);

  console.time(`SELECT categoryHeader FROM \'${sheetNameMaster}\' Sheet;`);
  categoryListHeader = sheet.getRange(1, column_for_category_header, row_to_read - 1, 1).getValues();
  console.timeEnd(`SELECT categoryHeader FROM \'${sheetNameMaster}\' Sheet;`);
  console.time(`SELECT categoryMaster FROM \'${sheetNameMaster}\' Sheet;`);
  categoryListMaster = sheet.getRange(1, column_for_category_master, row_to_read - 1, 1).getValues();
  console.timeEnd(`SELECT categoryMaster FROM \'${sheetNameMaster}\' Sheet;`);
  categoryListMaster_formated = listFormated(categoryListMaster);

  // cleanse category master to list.
  for (let j = 0; j < categoryListMaster_formated.length; j++) {
    if (categoryListHeader[j][0] == 'category_coat'){
      categoryNumber = 1;
    }else if (categoryListHeader[j][0] == 'category_tops'){
      categoryNumber = 3;
    }else if (categoryListHeader[j][0] == 'category_inner'){
      categoryNumber = 4;
    }else if (categoryListHeader[j][0] == 'category_bottoms'){
      categoryNumber = 5;
    }else if (categoryListHeader[j][0] == 'category_spats'){
      categoryNumber = 6;
    }
    switch (categoryNumber){
      case 1:
        coatListMaster.push(categoryListMaster_formated[j]);
        break;
      case 3:
        topsListMaster.push(categoryListMaster_formated[j]);
        break;
      case 4:
        innerListMaster.push(categoryListMaster_formated[j]);
        break;
      case 5:
        bottomsListMaster.push(categoryListMaster_formated[j]);
        break;
      case 6:
        spatsListMaster.push(categoryListMaster_formated[j]);
        break;
    }
  }
  categorySum = Number([coatListMaster.length,topsListMaster.length,innerListMaster.length,bottomsListMaster.length,spatsListMaster.length].reduce((a,b)=>a + b, 0));
  row_to_read - categorySum <= 2 ? console.warn(warningMessageList[0]) : false;
  if(row_to_read <= categorySum){
    console.error(errorMessageList[0]);
    return false;
  }

  // It's a step for cleanse data from "wardrobes👘".
  // declare variables to categorize wardrobes: today's "Wearing"
  let warmscoreDict = {}; // warmscore_coat, warmscore_outer, warmscore_tops, warmscore_inner, warmscore_bottoms, warmscore_spats

  // categorize wardrobes: today's "Wearing"
  for (let j = 0; j < wearingList_formated.length; j++) {
    if (wearingList_formated[j] == STATUS_WEARING) {
      sourceListForWrite.push([categoryList_formated[j],warmscoreList_formated[j],wearingList_formated[j]]);
    }
  }
  for (let j = 0; j < sourceListForWrite.length; j++) {
    if (innerListMaster.some(category => category == sourceListForWrite[j][0])){
      warmscoreDict['warmscore_inner'] = sourceListForWrite[j][1];
      innerList.push([sourceListForWrite[j][0], sourceListForWrite[j][1]]);
    }else if (spatsListMaster.some(category => category == sourceListForWrite[j][0])){
      warmscoreDict['warmscore_spats'] = sourceListForWrite[j][1];
      spatsList.push([sourceListForWrite[j][0], sourceListForWrite[j][1]]);
    }else if (bottomsListMaster.some(category => category == sourceListForWrite[j][0])){
      warmscoreDict['warmscore_bottoms'] = sourceListForWrite[j][1];
      bottomsList.push([sourceListForWrite[j][0], sourceListForWrite[j][1]]);
    }else if (topsListMaster.some(category => category == sourceListForWrite[j][0])){
      warmscoreDict['warmscore_tops'] = sourceListForWrite[j][1];
      topsList.push([sourceListForWrite[j][0], sourceListForWrite[j][1]]);
    }else if (coatListMaster.some(category => category == sourceListForWrite[j][0])){
      coatList.push([sourceListForWrite[j][0], sourceListForWrite[j][1]]);
    }
  }
  joinedListForLog = serializeArray(sourceListForWrite);
  console.info(`INFO: sourceListForWrite is ${joinedListForLog}`);

  // info handling for wardrobe combination.
  if(spatsList.length > 1){
    console.info('INFO: Nothing written record because of spats quantity failure.');
    return false;
  }
  if(bottomsList.length > 1){
    console.info('INFO: Nothing written record because of bottoms quantity failure.');
    return false;
  }
  if(innerList.length > 1){
    console.info('INFO: Nothing written record because of inner quantity failure.');
    return false;
  }
  if(topsList.length > 1){
    console.info('INFO: Nothing written record because of tops quantity failure.');
    return false;
  }
  if(coatList.length > 2){
    console.info('INFO: Nothing written record because of coat/outer quantity failure.');
    return false;
  }
  
  // set warmscore_coat and warmscore_outer to JSON
  if(coatList.length == 2){
    if(coatList[0][1] >= coatList[1][1]){
      warmscoreDict['warmscore_coat']  = coatList[0][1];
      warmscoreDict['warmscore_outer'] = coatList[1][1];
    }else{
      warmscoreDict['warmscore_coat']  = coatList[1][1];
      warmscoreDict['warmscore_outer'] = coatList[0][1];
    }
  }else if(coatList.length == 1){
    if(coatList[0][0] == 'Coat'){
      warmscoreDict['warmscore_coat'] = coatList[0][1];
    }else{
      warmscoreDict['warmscore_outer'] = coatList[0][1];
    }
  }else{
    // nothing to do.
  }

  // set warmscore=0 to JSON if value is nothing.
  ['warmscore_coat','warmscore_outer','warmscore_tops','warmscore_inner','warmscore_bottoms','warmscore_spats'].forEach(category => warmscoreDict[category]==null ? warmscoreDict[category]=0 : false);

  // info handling
  serializedDictForLog = JSON.stringify(warmscoreDict);
  console.info(`INFO: warmscoreDict is ${serializedDictForLog}`);

  // declare variables for write to "weather_today".
  let sheetNameWeather = SHEET_NAME_WEATHER_TODAY;
  let row_to_read_weather = 101;
  let row_to_write;
  column_for_id = 1;
  sheet = ss.getSheetByName(sheetNameWeather);

  // memorize number of row to read
  console.time(`SELECT TOP ${row_to_read_weather - 1} id FROM \'${sheetNameWeather}\' Sheet;`);
  idList = sheet.getRange(2, column_for_id, row_to_read_weather - 1, 1).getValues();
  console.timeEnd(`SELECT TOP ${row_to_read_weather - 1} id FROM \'${sheetNameWeather}\' Sheet;`);
  idList_formated = listFormated(idList);

  // warning message. If condition is false, nothing to do.
  row_to_read_actual = Number(idList_formated.reduce((a,b)=>Math.max(a,b)));
  row_to_read_weather - row_to_read_actual <= 2 ? console.warn(warningMessageList[1]) : false;
  if(row_to_read_weather <= row_to_read_actual){
    console.error(errorMessageList[1]);
    return false;
  }

  // read record from "weather_today" sheet
  let weatherRecordList = [];
  column_for_id = 1,
  column_for_date = 3,
  column_for_tmax = 5,
  column_for_tmin = 6,
  column_for_comfortscore = 8;
  console.time(`SELECT * FROM \'${sheetNameWeather}\' Sheet WHERE id = \'${row_to_read_actual}\';`);
  weatherRecordList = sheet.getRange(row_to_read_actual + 1, column_for_id, 1, column_for_comfortscore).getValues();
  console.timeEnd(`SELECT * FROM \'${sheetNameWeather}\' Sheet WHERE id = \'${row_to_read_actual}\';`);

  // info handling.
  if(weatherRecordList[0][column_for_date - 1] === ''){
    console.info('INFO: Nothing written record because of nothing today weather record failure.');
    return false;
  }

  // info handling.
  if(getDayStr(weatherRecordList[0][column_for_date - 1]) != getTodayStr()){
    console.info('INFO: Nothing written record because of nothing today weather record failure.');
    return false;
  }

  // It's a step for write to "history_wear".
  // declare variables for write to "history_wear".
  let sheetNameHistory = SHEET_NAME_HISTORY_WEAR;
  let row_to_read_history = 201;
  column_for_id = 1;
  sheet = ss.getSheetByName(sheetNameHistory);

  // memorize number of row to read
  console.time(`SELECT TOP ${row_to_read_history - 1} id FROM \'${sheetNameHistory}\' Sheet;`);
  idList = sheet.getRange(2, column_for_id, row_to_read_history, 1).getValues();
  console.timeEnd(`SELECT TOP ${row_to_read_history - 1} id FROM \'${sheetNameHistory}\' Sheet;`);
  idList_formated = listFormated(idList);

  // warning message. If condition is false, nothing to do.
  row_to_write = Number(idList_formated.reduce((a,b)=>Math.max(a,b)));
  row_to_read_history - row_to_write <= 1 ? console.warn(warningMessageList[1]) : false;
  if(row_to_read_history <= row_to_write){
    console.error(errorMessageList[1]);
    return false;
  }

  // write record to "history_wear" sheet
  let recordHistoryWear = [[row_to_write + 1,
                            userId,
                            warmscoreDict['warmscore_coat'],
                            warmscoreDict['warmscore_outer'],
                            warmscoreDict['warmscore_tops'],
                            warmscoreDict['warmscore_inner'],
                            warmscoreDict['warmscore_bottoms'],
                            warmscoreDict['warmscore_spats'],
                            getDayStr(weatherRecordList[0][column_for_date - 1]),
                            weatherRecordList[0][column_for_tmax - 1],
                            weatherRecordList[0][column_for_tmin - 1],
                            weatherRecordList[0][column_for_comfortscore - 1]
                          ]];
  joinedListForLog = serializeArray(recordHistoryWear);
  console.info(`INFO: recordHistoryWear is ${joinedListForLog}`);
  console.time(`UPSERT \'${sheetNameHistory}\'Sheet SET \'userid\'~\'temperature_min\' = * WHERE \'id\' = ${row_to_read_history};`);
  sheet.getRange(row_to_write + 2, 1, 1, 12).setValues(recordHistoryWear);
  console.timeEnd(`UPSERT \'${sheetNameHistory}\'Sheet SET \'userid\'~\'temperature_min\' = * WHERE \'id\' = ${row_to_read_history};`);

  return true;
}

function serializeArray(targetArray){
  let onlyStringArray = [];
  targetArray.forEach(item => {
    onlyStringArray.push(`[${String(item)}]`);
  });
  let serializedArray = onlyStringArray.join(',');
  return serializedArray;
}

function listFormated(listReadFromGss) {
  let listFormated = [];
  for (let j = 0; j < listReadFromGss.length; j++) {
    // "if" statement in one liner. If '', nothing to do.
    listReadFromGss[j][0]=='' ? true : listFormated.push(listReadFromGss[j][0]);
  }
  return listFormated
}

function getMostFrequentElement(dataList){
  /*
  Get the most frequent element in data.
  dataList: (list of data)
  */
  let freq;
  let listFreq = [];
  dataList.forEach((i) => {
    freq = dataList.filter(n => n == i).length;   // count appearance frequency
    listFreq.push(freq); // Add freq to listFreq
  });
  var indexMostFreq = listFreq.indexOf(listFreq.reduce((a,b)=>Math.max(a,b)));
  return dataList[indexMostFreq] // return data
}

function getTodayWeather(location, apiKey) {
  // error handling.
  if(typeof apiKey === "undefined" || apiKey == ''){
    console.error(errorMessageList[2]);
    return false;
  }

  // declare variables to get weather info.
  let apiUrl = `${OPEN_WEATHER_MAP_ENDPOINT}?q=${location}&mode=json&appid=${apiKey}`;
  let options = {
    'method' : 'get',
    'contentType': 'application/json'
  };
  let response = UrlFetchApp.fetch(apiUrl, options);
  let data = JSON.parse(response.getContentText());
  let weatherData = data['list'];

  // Prepare to get weather information
  let nowDate = new Date();
  let nowDay  = nowDate.getDate();
  let n_days = 3;     // In this case: today, tomorrow and day-after-tomorrow.
  let listDays = []; // List about days (datetime format)
  for (let i = 0; i < n_days; i++){
    d = {'day': nowDay + 1 * i};
    d['list_tmax']        = []; // List about max temperature
    d['list_tmin']        = []; // List about min temperature
    d['list_description'] = []; // List about weather description
    d['list_main']        = []; // List about weather main
    listDays.push(d);
  }

  // Get weather information by comparing today date and date of info from openweathermap.
  let indexOfSpaceInWeatherDate = Number(weatherData[0]['dt_txt'].indexOf(' '));
  listDays.forEach((k) => {
    weatherData.forEach((i) => { // scan weather list
      let weatherDate = String(i['dt_txt']);
      if (weatherDate.slice(indexOfSpaceInWeatherDate - 2, indexOfSpaceInWeatherDate) == k['day']){
        k['list_tmax'].push(Math.round((i['main']['temp_max'] - KELVIN) * 10) / 10);
        k['list_tmin'].push(Math.round((i['main']['temp_min'] - KELVIN) * 10) / 10);
        k['list_description'].push(i['weather'][0]['description']);
        k['list_main'].push(i['weather'][0]['main']);
      }
    });
  });

  // Get weather information from list
  tmax = Number(listDays[0]['list_tmax'].reduce((a,b)=>Math.max(a,b)));  // determine max temperature (Day 0)
  tmin = Number(listDays[0]['list_tmin'].reduce((a,b)=>Math.min(a,b)));  // determine min temperature (Day 0)
  description = getMostFrequentElement(listDays[0]['list_description']); // determine weather description (Day 0)
  main = getMostFrequentElement(listDays[0]['list_main']);               // determine weather main (Day 0)

  let dictWeather = {'tmax': tmax, 'tmin': tmin, 'description': description, 'main': main};
  return dictWeather;
}

function zeroPadding(num, length){
  return ('0000000000' + num).slice(-length);
}

function getToday(){
  let today    = new Date();
  return today;
}

function getTodayStr(){
  let today    = getToday();
  let todayStr = getDayStr(today);
  return todayStr;
}

function getDayStr(day){
  let dayStr = `${day.getFullYear()}-${zeroPadding(Number(day.getMonth()+1), 2)}-${zeroPadding(Number(day.getDate()), 2)}`;
  return dayStr;
}

function makeLearnedModel() {

}

function recommendTodayWardrobes() {
  // declare variables for prepare.
  let ss,
    sheetName = SHEET_NAME_1ST,
    sheet,
    row_to_read           = 51,
    column_for_id         = 1,
    column_for_category   = 4,
    column_for_warmscore  = 7,
    column_for_wearing    = 9,
    column_for_recommend  = 10,
    joinedListForLog,
    serializedDictForLog;
  ss = SpreadsheetApp.getActive();
  sheet = ss.getSheetByName(sheetName);


}

function recordTodayWeather(dictWeather){
  // declare variables for prepare.
  let ss,
    sheetName = SHEET_NAME_WEATHER_TODAY_BACKUP,
    sheet,
    row_to_read              = 51,
    column_for_id            = 1,
    column_for_comfortscore  = 8;
  ss = SpreadsheetApp.getActive();
  sheet = ss.getSheetByName(sheetName);

  // declare list for get list from GSS.
  let idList        = [],
    idList_formated = [];

  // memorize number of row to read
  console.time(`SELECT TOP ${row_to_read - 1} id FROM \'${sheetName}\' Sheet`);
  idList = sheet.getRange(2, column_for_id, row_to_read - 1, 1).getValues();
  console.timeEnd(`SELECT TOP ${row_to_read - 1} id FROM \'${sheetName}\' Sheet`);
  idList_formated = listFormated(idList);

  // warning message. If condition is false, nothing to do.
  let row_to_read_actual = Number(idList_formated.reduce((a,b)=>Math.max(a,b)));
  row_to_read - row_to_read_actual <= 2 ? console.warn(warningMessageList[0]) : false;
  if(row_to_read_actual >= row_to_read - 1){
    console.error(errorMessageList[0]);
    return false;
  }

  // write record to "weather_today" sheet
  let recordWeather = [[row_to_read_actual + 1,
                        dictWeather['location'],
                        dictWeather['date'],
                        dictWeather['main'],
                        dictWeather['tmax'],
                        dictWeather['tmin'],
                        0
                      ]];
  console.time(`INSERT \'${sheetName}\'Sheet SET \'id\'~\'humidity\' = *;`);
  sheet.getRange(row_to_read_actual + 2, 1, 1, column_for_comfortscore - 1).setValues(recordWeather);
  console.timeEnd(`INSERT \'${sheetName}\'Sheet SET \'id\'~\'humidity\' = *;`);
}

function manageTodayWeather() {  
  // Prepare record to write GSS.
  let dict_for_weather_doay = {};
  let location = 'Tokyo';
  dict_for_weather_doay['location'] = location;
  dict_for_weather_doay['date'] = getTodayStr();

  // Prepare record to write GSS about weather information.
  let myApiKey = OPEN_WEATHER_MAP_API_KEY;
  let dictWeather = getTodayWeather(location, myApiKey);
  for(let key in dictWeather){
    dict_for_weather_doay[key] = dictWeather[key];
  }
  recordTodayWeather(dict_for_weather_doay);
}

function executeBatch() {
  let isRecordedTodayWearing;
  isRecordedTodayWearing = recordTodayWearing();
  if (isRecordedTodayWearing == false){
    return false;
  }
  makeLearnedModel();
  manageTodayWeather();
}
