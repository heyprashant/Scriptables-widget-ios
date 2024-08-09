const h=5
  
const w = new ListWidget()
w.backgroundColor=new Color("#222222")

// workout contents
const fileManager = FileManager.iCloud()
const dataPath =  fileManager.documentsDirectory() + "/health_data.json"


let stretchData = {}
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
  
  stretchData = dataContent["Meditate"] || {}
  workoutData = dataContent["Exercise"] || {}
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

  const titlew = w.addText("Habit Log")
  titlew.textColor = new Color("#e587ce")
  titlew.font = Font.boldSystemFont(13)
  w.addSpacer(6)
  
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
      const stretchForDay = stretchData[dataKey]
      const workoutForDay = workoutData[dataKey]
      
      // left
      if (stretchForDay) {
        context.setFillColor(new Color("#0198E1"))
        let path = new Path()
        path.addRoundedRect(new Rect(x + 1, y + 2, 2, height - 4), 2, 2)  // Change to vertical line
        context.addPath(path)
        context.fillPath()
      }

      //right
      if (stretchForDay) {
        context.setFillColor(new Color("#0198E1"))
        let path = new Path()
        path.addRoundedRect(new Rect(x + width - 3, y + 2, 2, height - 4), 2, 2)  // Vertical line on the right
        context.addPath(path)
        context.fillPath()
      }


      //top
      if (stretchForDay) {
        context.setFillColor(new Color("#0198E1"))
        let path = new Path()
        path.addRoundedRect(new Rect(x + 2, y, width - 4, 2), 2, 2)
         context.addPath(path)
         context.fillPath()
      }



      //bottom
       
      if (stretchForDay) {
        context.setFillColor(new Color("#0198E1"))
        let path = new Path()
        path.addRoundedRect(new Rect(x + 2, y + height - 3, width - 4, 2), 2, 2)
        context.addPath(path)
        context.fillPath()
      }




    //   // sherbet
    //   path = new Path()
    //   if (workoutForDay) {
    //     context.setFillColor(new Color("#dc7474"))
    //     path.addEllipse(new Rect(x + 2, y, width - 4, height - 4))
    //   } else {
    //     context.setFillColor(new Color("#dc747466"))
    //     path.addEllipse(new Rect(x + 3, y + 1, width - 6, height - 6))
    //   }
    //   context.addPath(path)
    //   context.fillPath()
      
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
  drawStretched(context, 220, colWidth + 6, colWidth)
  
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

function drawWorkoutLegend(context, x, y, colWidth) {  
  context.setFillColor(new Color("#dc7474"))
  let path = new Path()
  path.addEllipse(new Rect(x, y, colWidth - 4, colWidth - 4))
  context.addPath(path)
  context.fillPath()
  
  context.setTextAlignedLeft()
  context.setTextColor(new Color("#ffffff"))
  context.drawTextInRect("Exercised", new Rect(x + colWidth + 2, y + 4, 80, colWidth))
}

function drawStretched(context, x, y, colWidth) {  
  context.setFillColor(new Color("#0198E1"))
  let path = new Path()
  path.addRoundedRect(new Rect(x, y + 10, colWidth - 4, 2), 2, 2)
  context.addPath(path)
  context.fillPath()
  
  context.setTextAlignedLeft()
  context.setTextColor(new Color("#ffffff"))
  context.drawTextInRect("Meditated", new Rect(x + colWidth + 2, y + 4, 90, colWidth))
}
