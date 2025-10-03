// renderer.js

const browseBtn = document.getElementById('browseBtn');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const pathDisplay = document.getElementById('pathDisplay');
const output = document.getElementById('output');
const depthInput = document.getElementById('depthInput');
const includeFiles = document.getElementById('includeFiles');

let selectedPath = null;
let currentTree = '';

// Browse button
browseBtn.addEventListener('click', async () => {
  try {
    const path = await window.api.openFolderDialog();
    if (path) {
      selectedPath = path;
      pathDisplay.textContent = path;
    } else {
      pathDisplay.textContent = "No folder selected";
      selectedPath = null;
    }
  } catch (err) {
    console.error('Browse error:', err);
    output.textContent = `❌ Failed to open folder: ${err.message}`;
  }
});

// Generate button
generateBtn.addEventListener('click', async () => {
  if (!selectedPath) {
    output.textContent = "❌ Please select a folder first.";
    return;
  }

  const options = {
    depth: parseInt(depthInput.value),
    includeFiles: includeFiles.checked
  };

  output.textContent = "🔄 Scanning directory...";
  try {
    const result = await window.api.scanDirectory(selectedPath, options);
    if (result.success) {
      currentTree = result.tree;
      output.textContent = currentTree;
    } else {
      output.textContent = `❌ Error: ${result.error}`;
      currentTree = '';
    }
  } catch (err) {
    output.textContent = `❌ Request failed: ${err.message}`;
    console.error('Scan error:', err);
    currentTree = '';
  }
});

// Copy to Clipboard
copyBtn.addEventListener('click', () => {
  if (!currentTree) {
    alert("Nothing to copy. Generate a tree first.");
    return;
  }
  navigator.clipboard.writeText(currentTree)
    .then(() => alert("✅ Copied to clipboard!"))
    .catch(err => alert(`❌ Copy failed: ${err.message}`));
});

// Save as .txt
saveBtn.addEventListener('click', async () => {
  if (!currentTree) {
    alert("Nothing to save. Generate a tree first.");
    return;
  }

  try {
    const filePath = await window.api.saveFileDialog();
    if (!filePath) return;

    const success = await window.api.saveFile(filePath, currentTree);
    if (success) {
      alert(`✅ Saved to:\n${filePath}`);
    } else {
      alert("❌ Save failed.");
    }
  } catch (err) {
    console.error('Save error:', err);
    alert(`❌ Save failed: ${err.message}`);
  }
});

// ✅ Optional: Debug log (remove or comment out if not needed)
// console.log('renderer.js loaded and ready');