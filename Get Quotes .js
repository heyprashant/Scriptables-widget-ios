// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
const widget = new ListWidget()
widget.backgroundColor = new Color("#222222")

// Function to load and parse JSON file
function loadQuotes() {
  let fileManager = FileManager.iCloud()
  let quotesPath = fileManager.documentsDirectory() + "/quotes.json"
  
  if (!fileManager.fileExists(quotesPath)) {
    throw new Error("Quotes file not found.")
  }
  
  let fileContent = fileManager.readString(quotesPath)
  return JSON.parse(fileContent)
}

// Function to get a random quote
function getRandomQuote(quotes) {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
}

try {
  // Load and parse quotes from file
  const quotes = loadQuotes()

  // Get a random quote
  const { quote, author } = getRandomQuote(quotes)

  // Display the quote
  let quoteText = widget.addText(quote)
  quoteText.textColor = Color.white()
  quoteText.font = Font.mediumMonospacedSystemFont(14) // Adjusted font size for lock screen
  quoteText.centerAlignText()
  widget.addSpacer(2) // Adjusted spacer size for lock screen

  if (author) {
    let authorText = widget.addText(`- ${author}`)
    authorText.textColor = Color.white()
    authorText.font = Font.mediumMonospacedSystemFont(13) // Adjusted font size for lock screen
    authorText.centerAlignText()
  }

} catch (error) {
  console.error("Error loading quotes:", error)
  
  // Display error message
  let errorText = widget.addText("Error loading quotes.")
  errorText.textColor = Color.red()
  errorText.font = Font.boldSystemFont(10) // Adjusted font size for lock screen
  errorText.centerAlignText()
}

// Resize widget for lock screen
widget.setPadding(5, 5, 5, 5)
widget.spacing = 2

if (config.runsInWidget) {
  // No need to set widget size for lock screen widgets
  Script.setWidget(widget)
} else {
  widget.presentMedium()
}

Script.complete()
