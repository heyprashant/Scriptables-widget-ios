// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic;
// ================================
// Last 6 Months Activity Heatmap Widget
// Title at Top, Header Centered, Full Recent Week
// ================================

// -------------------------
// Sample activity data (activity)
// Use your dates in "YYYY-MM-DD" format. Extend this data as needed.
const activityData = {
    "2024-03-10": true,
    "2024-03-11": false,
    "2024-04-05": true,
    "2024-04-15": true,
    "2024-05-20": true,
    "2024-06-15": false,
    "2024-07-01": true,
    "2024-07-15": true,
    "2024-08-05": false,
    "2024-08-12": true,
    "2024-08-20": true
  };
  
  
  
  // workout contents
  const fileManager = FileManager.iCloud()
  const dataPath =  fileManager.documentsDirectory() + "/health_data.json"
  
  let wakeupdata = {}
  let studyData = {}
  let leetcodeData = {}
  let readData = {}
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
    
  
    wakeupdata = dataContent["WakeUp"] || {}
    studyData = dataContent["Study"] || {}
    leetcodeData = dataContent["Leetcode"] || {} 
    readData = dataContent["Read"] || {}   
    meditateData = dataContent["Meditate"] || {}
    workoutData = dataContent["Exercise"] || {}
  
  }
  
  
  drawHeatmapWidget(leetcodeData, "box", "#24292e", "#2dba4e", "#2b3137", "Leetcode");
  
  function drawHeatmapWidget(data, cellShape, bgColor, activeCellColor, inactiveCellColor, activity) {
  
    const w = new ListWidget();
    w.backgroundColor = new Color(bgColor); // Dark background
    w.setPadding(0, 7, 0, 5); // Set widget padding (top, right, bottom, left)
  
    // -------------------------
    // Header: Title aligned to center at the very top
    // -------------------------
    const headerStack = w.addStack();
    headerStack.layoutHorizontally();
    headerStack.centerAlignContent();
    headerStack.addSpacer();
    const headerTitle = headerStack.addText(`${activity} Heatmap`);
    headerTitle.font = new Font("Menlo-Bold", 15);
    headerTitle.textColor = new Color("#FFFFFF");
    headerStack.addSpacer();
    w.addSpacer(15);
  
  
  
  
  
    // -------------------------
    // Determine the period: Last 6 months (from six months ago until today),
    // but extend the end to cover the full recent week (Saturday–Friday).
    // -------------------------
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
  
    // Adjust the grid start date to the previous Saturday of sixMonthsAgo
    let gridStart = new Date(sixMonthsAgo);
    while (gridStart.getDay() !== 6) { // 6 = Saturday
      gridStart.setDate(gridStart.getDate() - 1);
    }
  
    // Determine the full current week end: find the most recent Saturday and add 6 days.
    let currentWeekStart = new Date(now);
    while (currentWeekStart.getDay() !== 6) {
      currentWeekStart.setDate(currentWeekStart.getDate() - 1);
    }
    let fullRecentWeekEnd = new Date(currentWeekStart);
    fullRecentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  
    // Use fullRecentWeekEnd as the end date for the grid.
    const endDate = fullRecentWeekEnd;
  
    // Calculate total days and number of weeks (columns) in the period
    const totalDays = Math.ceil((endDate - gridStart) / (1000 * 60 * 60 * 24)) + 1;
    const cols = Math.ceil(totalDays / 7);
    const rows = 7; // Always 7 days (Saturday to Friday)
  
    // -------------------------
    // Grid & Canvas configuration
    // -------------------------
    // Reserve a fixed height for month labels (no extra space above the grid).
    const monthLabelHeight = 16;  // Height for month labels
    const leftMargin = 15;        // Space on the left for day labels
    const gridTopOffset = monthLabelHeight; // Grid starts immediately below the month labels
  
    const cellSize = 10;  // Size of each cell (width and height)
    const gap = 3;        // Gap between cells
  
    // Compute grid dimensions (without margins)
    const gridWidth = cols * cellSize + (cols - 1) * gap;
    const gridHeight = rows * cellSize + (rows - 1) * gap;
  
    // Canvas size covers the grid plus left margin and the month labels area.
    const canvasWidth = leftMargin + gridWidth;
    const canvasHeight = gridTopOffset + gridHeight;
  
    // Create a drawing context for the heatmap image
    const ctx = new DrawContext();
    ctx.size = new Size(canvasWidth, canvasHeight);
    ctx.opaque = false;
    ctx.respectScreenScale = true;
  
    // -------------------------
    // Define Colors and Text Color
    // -------------------------
    const activeColor = new Color(activeCellColor);   // Green for active days
    const inactiveColor = new Color(inactiveCellColor);  // Gray for inactive days
    const textColor = new Color("#FFFFFF");      // White for text
  
    // -------------------------
    // Pre-calculate Month Label Positions
    // For each cell in the grid, if the date is the 1st of a month (within the period),
    // record the column index for that month.
    let monthPositions = {};
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        let d = new Date(gridStart);
        d.setDate(d.getDate() + col * 7 + row);
        if (d > endDate) continue;
        if (d.getDate() === 1 && monthPositions[d.getMonth()] === undefined) {
          monthPositions[d.getMonth()] = col;
        }
      }
    }
  
    // Array of month abbreviations
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
    // -------------------------
    // Draw Month Labels (in the reserved top area)
    // -------------------------
    ctx.setFont(Font.boldSystemFont(12));
    ctx.setTextColor(textColor);
    for (let m = 0; m < 12; m++) {
      if (monthPositions[m] !== undefined) {
        // X position: leftMargin + column index * (cellSize+gap)
        let x = leftMargin + monthPositions[m] * (cellSize + gap);
        // Y position: within the reserved month label area (centered vertically)
        let y = (monthLabelHeight - 16) / 2;
        ctx.drawTextInRect(monthNames[m], new Rect(x, y, 40, 16));
      }
    }
  
    // -------------------------
    // Draw Day Labels (along the left margin)
    // -------------------------
    // Our grid rows: row 0 = Saturday, row 1 = Sunday, row 2 = Monday, ... , row 6 = Friday.
    const dayLabels = ["S", "S", "M", "T", "W", "T", "F"];
    ctx.setFont(Font.semiboldSystemFont(10));
    for (let row = 0; row < rows; row++) {
  
      if (row % 2 == 0) {
        let label = dayLabels[row];
        // Y position: aligned with the center of each grid cell
        let y = gridTopOffset + row * (cellSize + gap) + cellSize / 2 - 6;
        ctx.drawTextInRect(label, new Rect(0, y, leftMargin - 4, 16));
        
      }
    
    }
  
  
    // -------------------------
    // Draw the Heatmap Grid 
    // -------------------------
  
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        let d = new Date(gridStart);
        d.setDate(d.getDate() + col * 7 + row);
        if (d > endDate) continue;
        
        // Format the date as "YYYY-MM-DD"
        const yyyy = d.getFullYear();
        const mm = ("0" + (d.getMonth() + 1)).slice(-2);
        const dd = ("0" + d.getDate()).slice(-2);
        const dateStr = `${yyyy}-${mm}-${dd}`;
        
        // Determine cell color based on activity data (default false if missing)
        const isActive = data[dateStr] === true;
        const fillColor = isActive ? activeColor : inactiveColor;
  
        if(cellShape == "circle") {
          // Calculate cell position (accounting for left margin and gridTopOffset)
          let x = leftMargin + col * (cellSize + gap) + cellSize / 2;
          let y = gridTopOffset + row * (cellSize + gap) + cellSize / 2;
          let radius = cellSize / 2;
          
          // Draw circular cell
          ctx.setFillColor(fillColor);
          ctx.fillEllipse(new Rect(x - radius, y - radius, radius * 2, radius * 2));
        }
        else {
            // Calculate cell position (accounting for left margin and gridTopOffset)
          const cornerRadius = 2;
          let x = leftMargin + col * (cellSize + gap);
          let y = gridTopOffset + row * (cellSize + gap);
          
          ctx.setFillColor(fillColor);
          ctx.fillRect(new Rect(x, y, cellSize, cellSize), cornerRadius);
        }
  
      }
    }
  
  
  
    // Get the final heatmap image
    const heatmapImage = ctx.getImage();
  
    // -------------------------
    // Add the heatmap image below the header (the header is already at the top)
    // -------------------------
    w.addImage(heatmapImage);
  
    // Present the widget
    w.presentMedium();
    Script.setWidget(w);
    Script.complete();
  
  }
  