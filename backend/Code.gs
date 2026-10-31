// Google Apps Script: receives RSVP submissions from the invitation page
// and adds them to the "Responses" sheet (or updates the guest's earlier row).
// Bound to the Google Sheet.
//
// Setup: see README.md ("Google Sheets setup").

var SHEET_NAME = 'Responses';
var SUMMARY_NAME = 'Summary';
// RSVPs are accepted until the end of 26 Dec 2026, Almaty time (UTC+5).
var DEADLINE = new Date('2026-12-26T23:59:59+05:00');
var HEADERS = ['Time (Almaty)', 'Name', 'Attending', 'Total people', 'Companions', 'Language', 'ID'];

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

    // Random per-browser id sent by the page; a repeat submission with the same id updates that guest's row.
    var id = /^[A-Za-z0-9_-]{8,64}$/.test(d.id) ? d.id : '';

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getSheet_();
      var row = [
        Utilities.formatDate(new Date(), 'Asia/Almaty', 'yyyy-MM-dd HH:mm:ss'),
        name,
        attending ? 'Yes' : 'No',
        attending ? 1 + companions.length : 0,
        companions.join(', '),
        d.lang === 'en' ? 'EN' : 'KK',
        id
      ];
      var at = id ? findRow_(sheet, id) : 0;
      if (at) {
        sheet.getRange(at, 1, 1, row.length).setValues([row]);
      } else {
        sheet.appendRow(row);
      }
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  }
}

// Run from the editor to create/refresh both sheets (safe to run again).
function setup() {
  var sheet = getSheet_();
  // Older sheets were created without the ID column.
  sheet.getRange(1, HEADERS.length).setValue(HEADERS[HEADERS.length - 1]).setFontWeight('bold');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName(SUMMARY_NAME) || ss.insertSheet(SUMMARY_NAME);
  s.clear();
  s.getRange('A1:A4').setValues([['Replies'], ['Coming (replies)'], ['Not coming (replies)'], ['Total guests coming']]);
  // These formulas have no argument separator (, or ;), so they work in any regional setting.
  s.getRange('B1').setFormula('=COUNTA(Responses!B2:B)');
  s.getRange('B2').setFormula('=SUMPRODUCT(--(Responses!C2:C="Yes"))');
  s.getRange('B3').setFormula('=SUMPRODUCT(--(Responses!C2:C="No"))');
  s.getRange('B4').setFormula('=SUM(Responses!D2:D)');
  s.getRange('A1:A4').setFontWeight('bold');
  s.setColumnWidth(1, 200);
}

// Row number (1-based) holding this guest id in the ID column, or 0.
function findRow_(sheet, id) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var ids = sheet.getRange(2, HEADERS.length, last - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (ids[i][0] === id) return i + 2;
  }
  return 0;
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
