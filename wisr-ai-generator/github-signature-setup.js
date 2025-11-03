import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_INSTRUCTIONS = '/mnt/c/Users/dyoun/Downloads/GitHub-Signature-Setup.html';
const OUTPUT_SIGNATURE_TEMPLATE = '/mnt/c/Users/dyoun/Downloads/Orly-Signature-GitHub.html';

async function createGitHubSetup() {
    console.log('🚀 Creating GitHub hosting setup for email signature...\n');

    // Instructions HTML
    const instructionsHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Host Signature on GitHub - Step by Step</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #f6f8fa;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #24292e;
            border-bottom: 3px solid #0366d6;
            padding-bottom: 10px;
        }
        h2 {
            color: #0366d6;
            margin-top: 30px;
        }
        .step {
            background: #f6f8fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0366d6;
        }
        .step h3 {
            margin-top: 0;
            color: #24292e;
        }
        code {
            background: #fff;
            padding: 3px 8px;
            border-radius: 3px;
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 14px;
            border: 1px solid #e1e4e8;
        }
        .url-box {
            background: #fff;
            padding: 15px;
            border: 2px solid #28a745;
            border-radius: 5px;
            font-family: monospace;
            word-break: break-all;
            margin: 15px 0;
        }
        .success {
            background: #d4edda;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #28a745;
            margin: 20px 0;
        }
        ol {
            line-height: 2;
        }
        ol li {
            margin: 10px 0;
        }
        .note {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐙 Host Orly's Signature on GitHub</h1>

        <div class="success">
            <strong>✅ Why GitHub?</strong>
            <ul>
                <li>Free, reliable hosting</li>
                <li>Fast CDN delivery</li>
                <li>Easy to update</li>
                <li>Professional solution</li>
            </ul>
        </div>

        <h2>📋 Setup Steps (5 minutes)</h2>

        <div class="step">
            <h3>Step 1: Create New GitHub Repository</h3>
            <ol>
                <li>Go to <a href="https://github.com/new" target="_blank"><strong>github.com/new</strong></a></li>
                <li>Repository name: <code>email-signatures</code></li>
                <li>Set to <strong>Public</strong> (required for image hosting)</li>
                <li>Check ✅ "Add a README file"</li>
                <li>Click <strong>"Create repository"</strong></li>
            </ol>
        </div>

        <div class="step">
            <h3>Step 2: Upload the Signature Image</h3>
            <ol>
                <li>In your new repo, click <strong>"Add file" → "Upload files"</strong></li>
                <li>Drag <code>Orly-Signature-Optimized.jpg</code> from your Downloads folder</li>
                <li>Commit message: <code>Add Orly Hakim signature</code></li>
                <li>Click <strong>"Commit changes"</strong></li>
            </ol>
        </div>

        <div class="step">
            <h3>Step 3: Get the Raw Image URL</h3>
            <ol>
                <li>Click on <code>Orly-Signature-Optimized.jpg</code> in your repo</li>
                <li>Click the <strong>"Download"</strong> button (or right-click the image)</li>
                <li>Copy the URL - it should look like:</li>
            </ol>
            <div class="url-box">
                https://raw.githubusercontent.com/<strong>YOUR-USERNAME</strong>/email-signatures/main/Orly-Signature-Optimized.jpg
            </div>
            <div class="note">
                <strong>💡 Tip:</strong> Replace <code>YOUR-USERNAME</code> with your actual GitHub username.
            </div>
        </div>

        <div class="step">
            <h3>Step 4: Add to Gmail</h3>
            <ol>
                <li>Go to <strong>Gmail Settings → Signature</strong></li>
                <li>Create new signature or edit existing</li>
                <li>Click the <strong>Image icon</strong> (mountain/photo icon in toolbar)</li>
                <li>Select <strong>"Web Address (URL)"</strong></li>
                <li>Paste your GitHub raw URL</li>
                <li>Set image width to: <code>550</code></li>
                <li>Click <strong>"Select"</strong></li>
                <li>Scroll down and click <strong>"Save Changes"</strong></li>
            </ol>
        </div>

        <div class="step">
            <h3>Step 5: Test It!</h3>
            <ol>
                <li>Compose a new email in Gmail</li>
                <li>Your signature should appear automatically</li>
                <li>Send a test email to yourself</li>
                <li>Verify the signature looks perfect ✨</li>
            </ol>
        </div>

        <div class="success">
            <h3>🎉 Done! Benefits:</h3>
            <ul>
                <li>✅ Full quality image (550px wide, no pixelation)</li>
                <li>✅ Works in ALL email clients</li>
                <li>✅ Fast loading from GitHub CDN</li>
                <li>✅ Easy to update (just replace the file in GitHub)</li>
                <li>✅ Professional hosting solution</li>
            </ul>
        </div>

        <h2>🔄 To Update Signature Later:</h2>
        <ol>
            <li>Go to your GitHub repo</li>
            <li>Click on the old image</li>
            <li>Click the trash icon to delete</li>
            <li>Upload new image with SAME filename</li>
            <li>Gmail will automatically use new image (might take 5-10 minutes to refresh)</li>
        </ol>

        <div class="note">
            <strong>📝 Alternative Method:</strong> If you prefer a clickable signature with links,
            check <code>Orly-Signature-GitHub.html</code> for HTML code you can paste directly into Gmail.
        </div>
    </div>
</body>
</html>`;

    await fs.promises.writeFile(OUTPUT_INSTRUCTIONS, instructionsHTML);
    console.log('✅ Created: GitHub-Signature-Setup.html');
    console.log('   (Step-by-step instructions)\n');

    // Create signature template HTML
    const signatureTemplateHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Orly Signature - GitHub Hosted Version</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
        }
        h1 { color: #1B4D3E; }
        .instructions {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 5px;
            border-left: 4px solid #0366d6;
            margin: 20px 0;
        }
        .code-box {
            background: #f6f8fa;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #d1d5da;
            margin: 20px 0;
            font-family: monospace;
            font-size: 13px;
            line-height: 1.6;
            overflow-x: auto;
        }
        .preview {
            border: 3px dashed #DAA520;
            padding: 20px;
            background: #fafafa;
            margin: 30px 0;
            text-align: center;
        }
        .warning {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Orly Hakim - GitHub Hosted Signature</h1>

        <div class="instructions">
            <h3>Before Using This:</h3>
            <ol>
                <li>Open <code>GitHub-Signature-Setup.html</code> for full instructions</li>
                <li>Upload <code>Orly-Signature-Optimized.jpg</code> to GitHub</li>
                <li>Get your GitHub raw URL</li>
                <li>Replace <code>YOUR-GITHUB-URL-HERE</code> below</li>
            </ol>
        </div>

        <h2>Method 1: Simple Image (Recommended)</h2>
        <div class="warning">
            <strong>✅ Easiest Method:</strong> Just use Gmail's built-in image insert
            <ol style="margin: 10px 0;">
                <li>Gmail Settings → Signature → Click Image icon</li>
                <li>Choose "Web Address (URL)"</li>
                <li>Paste your GitHub URL</li>
                <li>Set width to 550px</li>
                <li>Save!</li>
            </ol>
        </div>

        <h2>Method 2: HTML Signature Code</h2>
        <p>If you want to paste raw HTML into Gmail, use this code:</p>

        <div class="code-box">&lt;!-- Orly Hakim Email Signature --&gt;
&lt;img src="<strong style="color: #d73a49;">YOUR-GITHUB-URL-HERE</strong>"
     alt="Orly Hakim - Mortgage Banker - LendWise Mortgage"
     width="550"
     style="max-width: 100%; height: auto; display: block;"&gt;</div>

        <p><strong>Replace <code>YOUR-GITHUB-URL-HERE</code> with:</strong></p>
        <div class="code-box" style="background: #d4edda;">https://raw.githubusercontent.com/<strong>YOUR-USERNAME</strong>/email-signatures/main/Orly-Signature-Optimized.jpg</div>

        <h3>Example (with real username):</h3>
        <div class="code-box">&lt;img src="https://raw.githubusercontent.com/<strong>dyoung</strong>/email-signatures/main/Orly-Signature-Optimized.jpg"
     alt="Orly Hakim - Mortgage Banker - LendWise Mortgage"
     width="550"
     style="max-width: 100%; height: auto; display: block;"&gt;</div>

        <div class="preview">
            <h3>Preview (once uploaded to GitHub):</h3>
            <p style="color: #999; font-style: italic;">The signature will appear here after GitHub upload</p>
            <div style="width: 550px; height: 157px; background: #e9ecef; margin: 20px auto; display: flex; align-items: center; justify-content: center; border-radius: 5px;">
                <span style="color: #6c757d;">550px × 157px<br>Orly Hakim Signature</span>
            </div>
        </div>

        <div class="instructions">
            <h3>📝 To Paste HTML in Gmail:</h3>
            <ol>
                <li>Copy the HTML code above (after replacing the URL)</li>
                <li>Gmail Settings → Signature</li>
                <li>Press <code>Ctrl+Shift+I</code> (Windows) or <code>Cmd+Option+I</code> (Mac) to open Inspector</li>
                <li>Click the signature editor box</li>
                <li>In the Console tab, paste: <code>document.execCommand('insertHTML', false, 'YOUR-HTML-HERE')</code></li>
                <li>Press Enter</li>
            </ol>
            <p><strong>OR just use Method 1 above - it's much easier! 😊</strong></p>
        </div>
    </div>
</body>
</html>`;

    await fs.promises.writeFile(OUTPUT_SIGNATURE_TEMPLATE, signatureTemplateHTML);
    console.log('✅ Created: Orly-Signature-GitHub.html');
    console.log('   (Signature template with GitHub URL)\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📂 Files Ready in Downloads:');
    console.log('   1. Orly-Signature-Optimized.jpg (upload to GitHub)');
    console.log('   2. GitHub-Signature-Setup.html (read this first!)');
    console.log('   3. Orly-Signature-GitHub.html (signature code)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🚀 NEXT: Open GitHub-Signature-Setup.html');
    console.log('   Follow the 5 steps to upload and configure\n');
}

createGitHubSetup().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
