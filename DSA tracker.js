// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
const w = new ListWidget();
w.backgroundColor = new Color("#222222");

// File operations
const fileManager = FileManager.iCloud();
const dataPath = fileManager.documentsDirectory() + "/task_data.json";

// NEW DATA
let newData = args.shortcutParameter
if (newData) {  
  data = newData
  
  const string = JSON.stringify(data)
  fileManager.writeString(dataPath, string)
}

let task = {};

// READ DATA
if (fileManager.fileExists(dataPath)) {
  fileManager.downloadFileFromiCloud(dataPath)
  
  let dataContent = fileManager.readString(dataPath)
  task = JSON.parse(dataContent) || {"name": "DSA", "totalWeeks": 20, "activeSubtask": 0, "startDate": "2024-12-28", "subtasks": []}

}


// Example data structure (replace with your actual JSON structure)
// const exampleProgressData = {
//     "task": {
//         "name": "DSA",
//         "totalWeeks": 10,
//         "activeSubtask": 3,
//         "startDate": "2024-12-28",
//         "subtasks": ["Array", "String", "LinkedList", "HashMap", "Array", "Array", "Array", "Array",
//          "Array", "Array", "String", "LinkedList", "HashMap", "Array", "Array", "Array", "Array", "Array", "String", "LinkedList", 
//          "HashMap", "Array", "Array", "Array", "Array", "Array"
//        ]
//     }
// };

// Function to draw task progress with subtasks
function drawTaskProgress(task) {


    const taskStartDate = task.startDate;
    const name = task.name;
    const taskActiveSubtask = task.activeSubtask
    const subtasks = task.subtasks
    const totalWeeks = task.totalWeeks
    console.log(subtasks)

    const currentWeek = findCurrentWeek(taskStartDate);  

    
    // Days left label at the top-right corner
    const daysLeftText = `${countDaysLeft(taskStartDate, totalWeeks)} days left`;
    const daysLeftStack = w.addStack();
    daysLeftStack.layoutHorizontally();
    daysLeftStack.addSpacer(); // Pushes the text to the right
    const daysLeft = daysLeftStack.addText(daysLeftText);
    daysLeft.textColor = new Color("#ffffff");
    daysLeft.font = new Font("TrebuchetMS", 15)

    w.addSpacer(10); // Add some space between the top row and the next content

    // Task name and vertical progress bars
    const titleStack = w.addStack();
    titleStack.layoutHorizontally();
    titleStack.centerAlignContent();
    const taskName = titleStack.addText(name);
    taskName.textColor = new Color("#ffffff");
    taskName.font = new Font("Kailasa", 16);
    titleStack.addSpacer(5); // Space between task name and bars

     // Completed ratio
     const completedText = titleStack.addText(`[${taskActiveSubtask}/${subtasks.length}]   `);
     completedText.textColor = new Color("#ffffff");
     completedText.font = new Font("HelveticaNeue-UltraLightItalic", 10);;

titleStack.addSpacer(10); // Space between task name and bars

    // Shorter vertical bars for "DSA"
    const taskBars = miniProgressionBar(10, 2, "#00FF00", taskActiveSubtask, subtasks.length);
    titleStack.addImage(taskBars);

    w.addSpacer(10); // Add some space between the task progress and the time left

    // Time left label and horizontal progress bars
    const totalTimeStack = w.addStack();
    totalTimeStack.layoutHorizontally();
    totalTimeStack.centerAlignContent();
    const timeLeft = totalTimeStack.addText("Weeks");
    timeLeft.textColor = new Color("#ffffff");
    timeLeft.font = new Font("SanFranciscoDisplay-Light", 15);
    totalTimeStack.addSpacer(2); // Space between label and bars

    // Weeks ratio
    const weeksText = totalTimeStack.addText(`[${currentWeek}/${totalWeeks}]   `);
    weeksText.textColor = new Color("#ffffff");
    weeksText.font = new Font("HelveticaNeue-UltraLightItalic", 10);

    const timeLeftBars = miniProgressionBar(3, 14, "#00FF00", currentWeek, totalWeeks);
    totalTimeStack.addImage(timeLeftBars);

    w.addSpacer(10);

     // Subtask progression row
    const subtaskStack = w.addStack();
    subtaskStack.layoutHorizontally();

    subtaskStack.spacing = 2;
    
    const activeIndex = taskActiveSubtask;
    const startIndex = Math.max(0, activeIndex - 1);
    const endIndex = Math.min(subtasks.length, startIndex + 3);

    for (let i = startIndex; i < endIndex; i++) {
        const subtask = subtasks[i];
        console.log(subtask)
        const isActive = i === activeIndex;
        const isCompleted = i < activeIndex ? true : false;

        const label = subtaskStack.addText(subtask);
        label.font = new Font("EuphemiaUCAS", 11);
        label.textColor = isActive ? new Color("#00FF00") : 
                          isCompleted ? new Color("#4F7942") : 
                          new Color("#666666");
        
        if (i < endIndex - 1) subtaskStack.addSpacer(4);
    }
    w.addSpacer(12);

    
    const weekStack = w.addStack();
    weekStack.layoutVertically();
    weekStack.spacing = 0;
    
    // Week header
    const headerStack = weekStack.addStack();
    headerStack.layoutHorizontally();
    const weekText = headerStack.addText(`Week #${currentWeek}`);
    headerStack.addSpacer(5)
    weekText.font = new Font("SanFranciscoDisplay-Light", 14);;
    weekText.textColor = Color.white();
    headerStack.addSpacer(10);
    
    // Day bars
    const barsStack = miniProgressionBar(3, 18, "#00FF00", currentDayOfTheWeek() , 7);
    headerStack.addImage(barsStack);

    // Day labels
    const labelsStack = weekStack.addStack();
    labelsStack.layoutHorizontally();
    labelsStack.addSpacer(71)
    labelsStack.spacing = 7;
    
    // Calculate week days
    const dayNames = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    for (let i = 0; i < 7; i++) {
        
        
        // Add label
        const label = labelsStack.addText(dayNames[i]);
        label.font = Font.mediumSystemFont(10);
        label.textColor = i < 2 ? Color.yellow(): Color.white();
        
        // Add spacers
        if (i < 6) {
            labelsStack.addSpacer(1);
        }
    }
    
}


// Function to calculate days left
function countDaysLeft(startDate, totalWeeks) {
    const now = new Date();
    const end = new Date(startDate);
    end.setDate(end.getDate() + (totalWeeks * 7)); // Calculate end date based on total weeks
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

//return current day of the week 0 means sat, 1 is sun ...
function currentDayOfTheWeek() {
    const today = new Date().getDay(); 
    
    return (today + 1)%7 + 1
}

function findCurrentWeek(startDate) {
    // Convert startDate to Date object if it's a string
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    // Find first Saturday (week start)
    const firstSaturday = new Date(start);
    while(firstSaturday.getDay() !== 6) { // 6 = Saturday
        firstSaturday.setDate(firstSaturday.getDate() - 1);
    }
    firstSaturday.setHours(0, 0, 0, 0);

    // Get current date at midnight
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Calculate time difference
    const diffTime = now - firstSaturday;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 

    // Calculate weeks (add 1 because week starts at 1)
    const currentWeek = Math.floor(diffDays / 7) + 1;

    return currentWeek > 0 ? currentWeek : 0; // Prevent negative weeks
}

// Draw progress for each task
drawTaskProgress(task);

w.presentMedium();
Script.setWidget(w);
Script.complete();

// Function to create mini progression bars (optimized for visual balance)
function miniProgressionBar(miniBarHeight, miniBarWidth, miniBarColor, activeBar, totalBars) {
    const context = new DrawContext();
    const gap = 4; // Automatic gap adjustment

    let groupWidth, groupHeight;

    groupWidth = (miniBarWidth * totalBars) + (gap * (totalBars - 1));
    groupHeight = miniBarHeight;


    context.size = new Size(groupWidth, groupHeight);
    context.opaque = false;
    context.respectScreenScale = true;

    // Fixed color handling
    const activeColor = new Color(miniBarColor);
    const inactiveColor = new Color("#444444"); // Darker gray for better contrast

    for (let i = 0; i < totalBars; i++) {
        const fillColor = (i < activeBar) ? activeColor : inactiveColor;
        const xPosition = i * (miniBarWidth + gap);
        
        // Horizontal bars: centered vertically
        const yPosition = (groupHeight - miniBarHeight) / 2;
        context.setFillColor(fillColor);
        context.fillRect(new Rect(xPosition, yPosition, miniBarWidth, miniBarHeight));
        
    }

    return context.getImage();
}

