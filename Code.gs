
/**
 * NLC Leadership Tracker - Google Apps Script Backend
 */

function doGet() {
  // Configures the HTML for high-resolution displays and modern browsers
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('NLC Leadership Tracker')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Saves JSON payload to UserProperties.
 * UserProperties are private to the logged-in user.
 */
function saveReports(jsonString) {
  try {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('NLC_TRACKER_DATA_ROOT', jsonString);
    return { success: true, timestamp: new Date().getTime() };
  } catch (e) {
    console.error('Save failed:', e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * Loads the JSON payload from UserProperties.
 */
function loadReports() {
  try {
    var userProperties = PropertiesService.getUserProperties();
    var data = userProperties.getProperty('NLC_TRACKER_DATA_ROOT');
    // Important: Return null if no data found so frontend knows to use defaults
    if (!data || data === "" || data === "null") {
      return null;
    }
    return data;
  } catch (e) {
    console.error('Load failed:', e.toString());
    return null;
  }
}
