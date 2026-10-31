// Google Apps Script: receives RSVP submissions from the invitation page
// and appends them to the "Responses" sheet. Bound to the Google Sheet.
//
// Setup: see README.md ("Google Sheets setup").

var SHEET_NAME = 'Responses';
var SUMMARY_NAME = 'Summary';
// RSVPs are accepted until the end of 26 Dec 2026, Almaty time (UTC+5).
var DEADLINE = new Date('2026-12-26T23:59:59+05:00');
var HEADERS = ['Time (Almaty)', 'Name', 'Attending', 'Total people', 'Companions', 'Language'];

function doPost(e) {
  try {
    if (new Date() > DEADLINE) return json_({ ok: false, error: 'closed' });

    var d = JSON.parse(e.postData.contents);
    var name = clean_(d.name);
    if (!name) return json_({ ok: false, error: 'name' });

    var attending = d.attending === true;
    var companions = [];
    if (attending && Array.isArray(d.companions)) {
      companions = d.companions.map(clean_).filter(String).slice(0, 20);
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getSheet_();
      sheet.appendRow([
        Utilities.formatDate(new Date(), 'Asia/Almaty', 'yyyy-MM-dd HH:mm:ss'),
        name,
        attending ? 'Yes' : 'No',
        attending ? 1 + companions.length : 0,
        companions.join(', '),
        d.lang === 'en' ? 'EN' : 'KK'
      ]);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  }
}

// Run once from the editor to create both sheets.
function setup() {
  getSheet_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName(SUMMARY_NAME) || ss.insertSheet(SUMMARY_NAME);
  s.clear();
  s.getRange('A1:B4').setValues([
    ['Replies', "=COUNTA(Responses!B2:B)"],
    ['Coming (replies)', '=COUNTIF(Responses!C2:C,"Yes")'],
    ['Not coming (replies)', '=COUNTIF(Responses!C2:C,"No")'],
    ['Total guests coming', '=SUM(Responses!D2:D)']
  ]);
  s.getRange('A1:A4').setFontWeight('bold');
  s.setColumnWidth(1, 200);
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Strip leading "=", "+", "-", "@" so a guest can't inject a sheet formula.
function clean_(v) {
  var s = String(v == null ? '' : v).trim().slice(0, 100);
  return s.replace(/^[=+\-@]+/, '');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
