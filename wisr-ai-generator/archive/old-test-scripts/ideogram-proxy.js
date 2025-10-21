/**
 * Simple proxy server for Ideogram API calls
 * Handles CORS by making server-side requests to Ideogram
 */

const http = require('http');
const https = require('https');

const IDEOGRAM_API_KEY = 'OzO_BqudwCQ8fIcywhSJa2noX0YL4WQm77ymd71nYl8yKN5zZDC2cA4NbJpvU7dYyW5XLRzhGkuWFJqrgWpItA';
const PORT = 3001;

const server = http.createServer((req, res) => {
    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Only handle POST requests to /generate
    if (req.method === 'POST' && req.url === '/generate') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                console.log('📤 Proxying request to Ideogram API...');
                console.log('Prompt length:', requestData.prompt?.length || 0);

                // Use V3 endpoint for V_3 model, legacy for V_2
                const isV3 = (requestData.model === 'V_3' || requestData.model === 'V_3_TURBO');

                let ideogramData, options;

                if (isV3) {
                    // V3 uses multipart/form-data with simpler structure
                    const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
                    const parts = [];

                    // Add prompt field
                    parts.push(`--${boundary}\r\n`);
                    parts.push(`Content-Disposition: form-data; name="prompt"\r\n\r\n`);
                    parts.push(`${requestData.prompt}\r\n`);

                    // Add aspect_ratio field - V3 uses lowercase format like '9x16' not 'ASPECT_9_16'
                    const aspectRatio = requestData.aspect_ratio === 'ASPECT_9_16' ? '9x16' :
                                       (requestData.aspect_ratio || '9x16');
                    parts.push(`--${boundary}\r\n`);
                    parts.push(`Content-Disposition: form-data; name="aspect_ratio"\r\n\r\n`);
                    parts.push(`${aspectRatio}\r\n`);

                    // Add magic_prompt field - V3 uses 'OFF', 'ON', or 'AUTO'
                    if (requestData.magic_prompt === false) {
                        parts.push(`--${boundary}\r\n`);
                        parts.push(`Content-Disposition: form-data; name="magic_prompt"\r\n\r\n`);
                        parts.push(`OFF\r\n`);
                    }

                    parts.push(`--${boundary}--\r\n`);

                    ideogramData = parts.join('');

                    options = {
                        hostname: 'api.ideogram.ai',
                        path: '/v1/ideogram-v3/generate',
                        method: 'POST',
                        headers: {
                            'Api-Key': IDEOGRAM_API_KEY,
                            'Content-Type': `multipart/form-data; boundary=${boundary}`,
                            'Content-Length': Buffer.byteLength(ideogramData)
                        }
                    };

                    console.log('🔄 Using V3 endpoint: /v1/ideogram-v3/generate');
                } else {
                    // V2 uses JSON with image_request wrapper
                    ideogramData = JSON.stringify({
                        image_request: {
                            prompt: requestData.prompt,
                            aspect_ratio: requestData.aspect_ratio || "ASPECT_9_16",
                            model: "V_2",
                            magic_prompt_option: requestData.magic_prompt === false ? "OFF" : "AUTO"
                        }
                    });

                    options = {
                        hostname: 'api.ideogram.ai',
                        path: '/generate',
                        method: 'POST',
                        headers: {
                            'Api-Key': IDEOGRAM_API_KEY,
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(ideogramData)
                        }
                    };

                    console.log('🔄 Using V2 endpoint: /generate');
                }

                console.log('🔑 Using API key:', IDEOGRAM_API_KEY.substring(0, 20) + '...');

                const proxyReq = https.request(options, (proxyRes) => {
                    let responseData = '';

                    proxyRes.on('data', (chunk) => {
                        responseData += chunk;
                    });

                    proxyRes.on('end', () => {
                        console.log('✅ Received response from Ideogram (status:', proxyRes.statusCode + ')');

                        if (proxyRes.statusCode === 200) {
                            console.log('🎉 Image generation successful!');

                            // Parse response and fetch image
                            const jsonResponse = JSON.parse(responseData);
                            if (jsonResponse.data && jsonResponse.data[0] && jsonResponse.data[0].url) {
                                const imageUrl = jsonResponse.data[0].url;
                                console.log('📥 Fetching image from Ideogram CDN...');

                                // Fetch the image and convert to base64
                                https.get(imageUrl, (imgRes) => {
                                    const chunks = [];
                                    imgRes.on('data', (chunk) => chunks.push(chunk));
                                    imgRes.on('end', () => {
                                        const buffer = Buffer.concat(chunks);
                                        const base64 = buffer.toString('base64');

                                        // Replace URL with base64 in response
                                        jsonResponse.data[0].base64 = base64;
                                        delete jsonResponse.data[0].url; // Remove URL to force base64 usage

                                        console.log('✅ Image converted to base64 (' + Math.round(base64.length / 1024) + 'KB)');

                                        res.writeHead(200, {
                                            'Content-Type': 'application/json',
                                            'Access-Control-Allow-Origin': '*'
                                        });
                                        res.end(JSON.stringify(jsonResponse));
                                    });
                                }).on('error', (err) => {
                                    console.error('❌ Error fetching image:', err);
                                    res.writeHead(500, {
                                        'Content-Type': 'application/json',
                                        'Access-Control-Allow-Origin': '*'
                                    });
                                    res.end(JSON.stringify({ error: 'Failed to fetch image' }));
                                });
                            } else {
                                // No image URL in response, forward as-is
                                res.writeHead(200, {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                });
                                res.end(responseData);
                            }
                        } else {
                            console.log('⚠️ Response:', responseData.substring(0, 200));
                            // Forward error response
                            res.writeHead(proxyRes.statusCode, {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            });
                            res.end(responseData);
                        }
                    });
                });

                proxyReq.on('error', (error) => {
                    console.error('❌ Proxy request error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Proxy request failed: ' + error.message }));
                });

                proxyReq.write(ideogramData);
                proxyReq.end();

            } catch (error) {
                console.error('❌ Error parsing request:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request: ' + error.message }));
            }
        });
    } else {
        // Invalid endpoint
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found. Use POST /generate' }));
    }
});

server.listen(PORT, () => {
    console.log('🚀 Ideogram Proxy Server running on http://localhost:' + PORT);
    console.log('📡 Endpoint: POST http://localhost:' + PORT + '/generate');
    console.log('');
    console.log('Ready to proxy requests to Ideogram API...');
});
