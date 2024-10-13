const widget = new ListWidget()
widget.backgroundColor=new Color("#222222")

// workout contents
const fileManager = FileManager.iCloud()
const dataPath =  fileManager.documentsDirectory() + "/health_data.json"
let meditateData = {}
let workoutData = {}

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
  
  meditateData = dataContent["Meditate"] || {}
  workoutData = dataContent["Exercise"] || {}
}

// Make widget
widget.addImage(getCalendarImage())
widget.presentMedium()

Script.setWidget(widget)
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

  const titlew = widget.addText("Healthy Living Log.                                             🔥   🚀")
  titlew.textColor = new Color("#C4B454")
  titlew.font = Font.boldSystemFont(12)
  widget.addSpacer(6)
  
  const context = new DrawContext()
  //context.size = new Size(colWidth * 7, (colWidth + 6) * 3)
  context.size = new Size(320, (colWidth +6) * 3)
  context.opaque = false
  context.respectScreenScale = true

  const weekOffset = [-7, 0, 7]
  
  var i
  for (i = 0; i < 3; i++) {
    drawWeek(context, i, colWidth, function(col, context, x, y, width, height) {        
      var offset = weekOffset[i]
      
      var curr = new Date; // get current date
      var dateOfFirstDayOfThisWeek = new Date(curr.setDate(curr.getDate() - curr.getDay()+1))
      var day = new Date(dateOfFirstDayOfThisWeek.setDate(dateOfFirstDayOfThisWeek.getDate() + offset + col))
      
      const dataKey = formatDate(day)
      const meditateForDay = meditateData[dataKey]
      const workoutForDay = workoutData[dataKey]
      
      // blue
      if (workoutForDay) {
        context.setFillColor(new Color("#8A9A5B"))
        let path = new Path()
        path.addRoundedRect(new Rect(x + 2, y + height - 1, width - 4, 2), 2, 2)
        context.addPath(path)
        context.fillPath()
      }
      
      // green
      path = new Path()
      if (meditateForDay) { 
        context.setFillColor(new Color("#1DB954"))
        path.addEllipse(new Rect(x + 2, y, width - 4, height - 4))
      } else {
        context.setFillColor(new Color("#355E3B"))
        path.addEllipse(new Rect(x + 3, y + 1, width - 6, height - 6))
      }
      context.addPath(path)
      context.fillPath()
      
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
  
  drawWorkoutLegend(context, 220, 0, colWidth)
  drawMeditated(context, 220, colWidth + 6, colWidth)
  
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




// Function to get current streak for a habit
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

// Example usage to get current and max streaks for Exercise and Meditation


function drawMeditated(context, x, y, colWidth) {  
  context.setFillColor(new Color("#1DB954"))  // Green color for Meditated
  let path = new Path()
  path.addRoundedRect(new Rect(x-11, y+5, colWidth-15, colWidth-15), 10,10)  // Medium-sized box with rounded corners
  context.addPath(path)
  context.fillPath()
  
  context.setTextAlignedLeft()
  context.setTextColor(new Color("#ffffff"))
  context.drawTextInRect(`Meditate:  ${getCurrentStreak(meditateData)}  ${getMaxStreak(meditateData)}`, new Rect(x + 5, y + 4, 200, colWidth))
}

function drawWorkoutLegend(context, x, y, colWidth) {  
  context.setFillColor(new Color("#8A9A5B"))  // Blue color for Exercised
  let path = new Path()
  path.addRoundedRect(new Rect(x-11, y+5, colWidth - 15, colWidth - 15), 10, 10)  // Medium-sized box with rounded corners
  context.addPath(path)
  context.fillPath()
  
  context.setTextAlignedLeft()
  context.setTextColor(new Color("#ffffff"))
  context.drawTextInRect(`Exercise:  ${getCurrentStreak(workoutData)}  ${getMaxStreak(workoutData)}`, new Rect(x + 5, y + 4, 200, colWidth ))
}
