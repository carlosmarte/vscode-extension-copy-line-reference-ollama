// This is a demo file to test the Copy Relative File Path + Line extension
// Right-click on any line number to test the functionality

export function hello() {
  console.log("Hello, World!");
}

export function goodbye() {
  console.log("Goodbye, World!");
}

export function testFunction() {
  // This function has multiple lines
  const message = "This is a test";
  const result = message.toUpperCase();
  return result;
}

// Try right-clicking on different line numbers
// Single line: should copy "demo/test-file.ts:5"
// Multiple lines: should copy "demo/test-file.ts:15-18"
