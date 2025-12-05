/**
 * Generate a CLI command that can be copied and run to add the generated form to a project
 * This encodes the files in base64 and creates a one-liner command
 */

interface FileData {
  path: string;
  content: string;
}

/**
 * Encode string to base64 (UTF-8 safe)
 */
function encodeBase64(str: string): string {
  // Convert to UTF-8 bytes then to base64
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = "";
  utf8Bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

/**
 * Generate a CLI command that creates files in the user's project
 */
export function generateCLICommand(files: FileData[]): string {
  // Encode files as JSON then base64
  const filesJson = JSON.stringify(files);
  const base64Data = encodeBase64(filesJson);

  // Split into chunks if too long (some terminals have limits)
  const maxChunkSize = 2000;
  const chunks: string[] = [];

  for (let i = 0; i < base64Data.length; i += maxChunkSize) {
    chunks.push(base64Data.slice(i, i + maxChunkSize));
  }

  // If data is small enough, use a simple one-liner
  if (chunks.length === 1) {
    return `echo "${base64Data}" | base64 -d | node -e "const fs=require('fs');const path=require('path');const data=JSON.parse(fs.readFileSync(0,'utf8'));data.forEach(f=>{const dir=path.dirname(f.path);if(dir!=='.')fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(f.path,f.content);console.log('Created:',f.path)});"`;
  }

  // For larger data, provide instructions to save to a temp file first
  return `# Data is too large for a single command. Run these steps:
# 1. Save the data to a file:
cat > formless-temp.json << 'EOF'
${filesJson}
EOF

# 2. Create the files:
node -e "const fs=require('fs');const path=require('path');const data=JSON.parse(fs.readFileSync('formless-temp.json','utf8'));data.forEach(f=>{const dir=path.dirname(f.path);if(dir!=='.')fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(f.path,f.content);console.log('Created:',f.path)});"

# 3. Clean up:
rm formless-temp.json`;
}

/**
 * Generate a PowerShell command for Windows users
 */
export function generatePowerShellCommand(files: FileData[]): string {
  const filesJson = JSON.stringify(files).replace(/"/g, '`"');

  return `$data = '${filesJson}' | ConvertFrom-Json; $data | ForEach-Object { $dir = Split-Path $_.path -Parent; if ($dir) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }; Set-Content -Path $_.path -Value $_.content; Write-Host "Created: $($_.path)" }`;
}

/**
 * Generate a simple copy-paste script that users can save and run
 */
export function generateStandaloneScript(files: FileData[]): string {
  const filesJson = JSON.stringify(files, null, 2);

  return `#!/usr/bin/env node
// Formless Generated Form Installer
// Save this file as 'install-form.js' and run: node install-form.js

import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

const files = ${filesJson};

console.log('📦 Installing Formless generated form...\\n');

files.forEach(file => {
  const dir = path.dirname(file.path);
  
  // Create directory if it doesn't exist
  if (dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(file.path, file.content, 'utf8');
  console.log('✅ Created:', file.path);
});

console.log('\\n🎉 Done! Your form files have been created.');
console.log('\\nNext steps:');
console.log('1. Install dependencies: pnpm add react-hook-form @hookform/resolvers zod');
console.log('2. Install shadcn components: pnpm dlx shadcn@latest add button input textarea');
console.log('3. Import and use your form component!');
`;
}

/**
 * Check if the command will be too long for most terminals
 */
export function isCommandTooLong(command: string): boolean {
  // Most terminals support at least 4096 characters
  // But we'll be conservative and warn at 3000
  return command.length > 3000;
}
