// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;
const w = new ListWidget()
w.backgroundColor=new Color("#222222")

// workout contents
const fileManager = FileManager.iCloud()
const dataPath =  fileManager.documentsDirectory() + "/health_data.json"


let wakeupdata = {}
let studyData = {}
let leetcodeData = {}
let readData = {}

// NEW DATA
let newData = args.shortcutParameter
if (newData) {  
  data = newData
  
  const string = JSON.stringify(data)
  fileManager.writeString(dataPath, string)
}

// READ DATA
if (fileManager.fileExists(dataPath)) {
  fileManager.downloadFileFromiCloud(dataPath)
  
  let dataContent = fileManager.readString(dataPath)
  dataContent = JSON.parse(dataContent)
  

  wakeupdata = dataContent["WakeUp"] || {}
  studyData = dataContent["Study"] || {}
  leetcodeData = dataContent["Leetcode"] || {} 
  readData = dataContent["Read"] || {}   
}

// Make widget
w.addImage(getCalendarImage())
w.presentMedium()

Script.setWidget(w)
Script.complete()

function formatDate(d) {
    var month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function getCalendarImage() {
  const width = 200
  const colWidth = width / 7.0

  const titlew = w.addText("Habit Log                                                               🔥   🚀")
  titlew.textColor = new Color("#dfe3ee")
  titlew.font = Font.boldSystemFont(12)
  w.addSpacer(5)
  
  const context = new DrawContext()
  //context.size = new Size(colWidth * 7, (colWidth + 6) * 3)
  context.size = new Size(320, (colWidth + 6) * 3)
  context.opaque = false
  context.respectScreenScale = true

  const weekOffset = [-7, 0, 7]
  
  var i
  for (i = 0; i < 3; i++) {
    drawWeek(context, i, colWidth, function(col, context, x, y, width, height) {        
      var offset = weekOffset[i]
      
      var curr = new Date; // get current date
      var dateOfFirstDayOfThisWeek = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)) //starting from monday
      var day = new Date(dateOfFirstDayOfThisWeek.setDate(dateOfFirstDayOfThisWeek.getDate() + offset + col))
      

      const dataKey = formatDate(day)

      const wakeupForDay = wakeupdata[dataKey]
      const studyForDay = studyData[dataKey]
      const leetcodeDay = leetcodeData[dataKey]
      const readForDay = readData[dataKey]
      

      //top
      if (wakeupForDay) {
        context.setFillColor(new Color("#daf8e3"))
        let path = new Path()
        path.addRoundedRect(new Rect(x + 2, y, width - 4, 2), 2, 2)
         context.addPath(path)
         context.fillPath()
      }

      //right
      if (studyForDay) {
        context.setFillColor(new Color("#97ebdb"))
        let path = new Path()
        path.addRoundedRect(new Rect(x + width - 3, y + 2, 2, height - 4), 2, 2)  // Vertical line on the right
        context.addPath(path)
        context.fillPath()
      }

      //bottom
      if (leetcodeDay) {
        context.setFillColor(new Color("#00c2c7"))
        let path = new Path()
        path.addRoundedRect(new Rect(x + 2, y + height - 3, width - 4, 2), 2, 2)
        context.addPath(path)
        context.fillPath()
      }

      // left
      if (readForDay) {
        context.setFillColor(new Color("#0086ad"))
        let path = new Path()
        path.addRoundedRect(new Rect(x + 1, y + 2, 2, height - 4), 2, 2)  // Change to vertical line
        context.addPath(path)
        context.fillPath()
      }

      
      let font = Font.lightSystemFont(12)
      if (day.getDate() === (new Date).getDate()) {
        font = Font.boldSystemFont(12)
      }
      
      // black
      context.setFillColor(new Color("#000000"))
      path = new Path()
      path.addEllipse(new Rect(x + 4, y + 2, width - 8, height - 8))
      context.addPath(path)
      context.fillPath()
      
      // TEXT
      context.setFont(font)
      
      context.setTextAlignedCenter()
      context.setTextColor(new Color("#ffffff"))
      context.drawTextInRect(day.getDate() + "", new Rect(x, y + 5, width, height - 5))
    })
  }
  

  drawWakeUp(context, 220, colWidth + 6, colWidth, "WakeUp", "#daf8e3")
  drawStudy(context, 220, colWidth + 6, colWidth, "Study", "#97ebdb")
  drawLeetcode(context, 220, colWidth + 6, colWidth, "Leetcode", "#00c2c7")
  drawRead(context, 220, colWidth + 6, colWidth, "Read", "#0086ad")

  return context.getImage()
}

function drawWeek(context, week, colWidth, callback) {  
  var i
  for (i = 0; i < 7; i++) {
    const x = colWidth * i
    const y = (colWidth + 6) * week
    const width = colWidth
    const height = colWidth
    
    // gray
    context.setFillColor(new Color("#48484b"))
    
    callback(i, context, x, y, width, height)
  }
}

function getCurrentStreak(habitData) {
  if (!habitData || Object.keys(habitData).length === 0) {
    return 0  // Edge case: No data
  }

  const today = new Date()
  let streak = 0

  // Iterate backwards day by day, checking for the habit
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)

    const formattedDate = formatDate(checkDate)

    // If the habit is logged for the day, increase the streak
    if (habitData[formattedDate]) {
      streak++
    } else {
      // If no habit found for a day, the streak is broken
      break
    }
  }

  return streak
}

// Function to get maximum streak for a habit
function getMaxStreak(habitData) {
  if (!habitData || Object.keys(habitData).length === 0) {
    return 0  // Edge case: No data
  }

  let maxStreak = 0
  let currentStreak = 0
  let previousDate = null

  // Iterate through all recorded days in habitData
  Object.keys(habitData).sort().forEach((dateKey) => {
    const habitLogged = habitData[dateKey]
    
    if (habitLogged) {
      // Convert the date string back to a Date object
      const currentDate = new Date(dateKey)
      
      // If this is the first day or the current day is consecutive to the previous
      if (previousDate && (currentDate - previousDate) === 86400000) {
        currentStreak++
      } else {
        // Reset the current streak if it's not consecutive
        currentStreak = 1
      }
      
      // Update the max streak if needed
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak
      }
      
      previousDate = currentDate
    }
  })

  return maxStreak
}



function drawWakeUp(context, x, y, colWidth, label, colorCode) {  
  context.setFillColor(new Color(colorCode))
  let path = new Path()
  path.addRoundedRect(new Rect(x-15, y - 28, 9,9), 2, 2)
  context.addPath(path)
  context.fillPath()
  
  context.setTextAlignedLeft()
  context.setTextColor(new Color("#ffffff"))
  context.drawTextInRect(`${label}:  ${getCurrentStreak(wakeupdata)}   ${getMaxStreak(wakeupdata)}`, new Rect(x - 30 + colWidth + 2, y - 31, 90, colWidth))
}

function drawStudy(context, x, y, colWidth, label, colorCode) {  
  context.setFillColor(new Color(colorCode))
  let path = new Path()
  path.addRoundedRect(new Rect(x-15, y-3,  9, 9), 2, 2)
  context.addPath(path)
  context.fillPath()
  
  context.setTextAlignedLeft()
  context.setTextColor(new Color("#ffffff"))
  context.drawTextInRect(`${label}:      ${getCurrentStreak(studyData)}   ${getMaxStreak(studyData)}`, new Rect(x - 30 + colWidth + 2, y - 6, 90, colWidth))
}

function drawLeetcode(context, x, y, colWidth, label, colorCode) {  
  context.setFillColor(new Color(colorCode))
  let path = new Path()
  path.addRoundedRect(new Rect(x-15, y + 22, 9,9), 2, 2)
  context.addPath(path)
  context.fillPath()
  
  context.setTextAlignedLeft()
  context.setTextColor(new Color("#ffffff"))
  context.drawTextInRect(`${label}: ${getCurrentStreak(leetcodeData)}  ${getMaxStreak(leetcodeData)}`, new Rect(x - 30 + colWidth + 2, y + 19, 90, colWidth))
}

function drawRead(context, x, y, colWidth, label, colorCode) {  
  context.setFillColor(new Color(colorCode))
  let path = new Path()
  path.addRoundedRect(new Rect(x-15, y + 48, 9,9), 2, 2)
  context.addPath(path)
  context.fillPath()
  
  context.setTextAlignedLeft()
  context.setTextColor(new Color("#ffffff"))
  context.drawTextInRect(`${label}:        ${getCurrentStreak(readData)}  ${getMaxStreak(readData)}`, new Rect(x - 30 + colWidth + 2, y + 44, 90, colWidth))
}