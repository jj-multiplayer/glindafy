const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL_ID = 'gemini-2.5-flash-image';
const GEMINI_API_KEY = 'AIzaSyA_oXiPlMjUks9bFGh4cRHyYNXNmSBxGQE';
const MAX_RETRY_ATTEMPTS = 3;
const FREE_TIER_RPM = 10;
const FREE_TIER_RPD = 100;
const MIN_REQUEST_INTERVAL = 60000 / FREE_TIER_RPM;

let requestTimestamps = [];
let dailyRequestCount = 0;
let lastResetDate = new Date().toDateString();

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'glindify-image',
    title: 'Glindify this image',
    contexts: ['image']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'glindify-image' && info.srcUrl) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'glindifyImage',
      imageUrl: info.srcUrl
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'transformImage') {
    handleImageTransformation(request, sendResponse);
    return true;
  }
  if (request.action === 'fetchImage') {
    handleImageFetch(request, sendResponse);
    return true;
  }
});

async function handleImageFetch(request, sendResponse) {
  try {
    const response = await fetch(request.imageUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    const mimeType = blob.type || 'image/jpeg';
    const detectedMimeType = mimeType.split(';')[0];
    if (detectedMimeType === 'image/gif' || detectedMimeType === 'image/svg+xml') {
      throw new Error(`Unsupported image format: ${detectedMimeType}`);
    }
    const supportedMimeType = (detectedMimeType === 'image/png' || detectedMimeType === 'image/jpeg') 
      ? detectedMimeType 
      : 'image/jpeg';
    sendResponse({
      status: 'success',
      data: base64,
      mimeType: supportedMimeType
    });
  } catch (error) {
    console.error('Image fetch error:', error);
    sendResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

async function handleImageTransformation(request, sendResponse) {
  try {
    const result = await transformImageWithGemini(
      request.imageData,
      request.mimeType || 'image/jpeg',
      request.prompt, 
      request.originalSrc
    );
    sendResponse({
      status: 'success',
      base64: result.base64Image,
      originalSrc: request.originalSrc
    });
  } catch (error) {
    console.error('Image transformation error:', error);
    sendResponse({
      status: 'error',
      message: error.toString(),
      originalSrc: request.originalSrc
    });
  }
}

function calculateRetryDelay(attempt) {
  return Math.pow(2, attempt) * 1000;
}

function calculateRateLimitDelay(retryAfterHeader, attempt) {
  return retryAfterHeader 
    ? parseInt(retryAfterHeader) * 1000 
    : Math.pow(2, attempt) * 5000 + 1000;
}

async function checkRateLimits() {
  const currentDate = new Date().toDateString();
  
  if (currentDate !== lastResetDate) {
    dailyRequestCount = 0;
    lastResetDate = currentDate;
    requestTimestamps = [];
  }
  
  if (dailyRequestCount >= FREE_TIER_RPD) {
    throw new Error(`Daily limit reached (${FREE_TIER_RPD} requests per day). Try again tomorrow.`);
  }
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(ts => now - ts < 60000);
  if (requestTimestamps.length >= FREE_TIER_RPM) {
    const waitTime = MIN_REQUEST_INTERVAL - (now - requestTimestamps[0]);
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return checkRateLimits();
    }
  }
  requestTimestamps.push(now);
  dailyRequestCount++;
}

async function transformImageWithGemini(imageBase64, mimeType, prompt, originalSrc) {
  await checkRateLimits();
  const apiUrl = `${GEMINI_API_URL}/${GEMINI_MODEL_ID}:generateContent`;
  let attempt = 0;
  while (attempt < MAX_RETRY_ATTEMPTS) {
    attempt++;
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify(buildImagePayload(imageBase64, mimeType, prompt))
      });
      if (!response.ok) {
        await handleErrorResponse(response, attempt);
        continue;
      }
      const result = await response.json();
      const transformedImage = extractImageFromResponse(result, originalSrc);
      if (transformedImage) return transformedImage;
      throw new Error('Gemini API response missing image data');
    } catch (error) {
      if (error.message?.startsWith('RATE_LIMIT:')) {
        await handleRateLimitError(error, attempt);
        continue;
      }
      if (attempt < MAX_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, calculateRetryDelay(attempt)));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Failed to transform image after maximum retry attempts');
}

function buildImagePayload(imageBase64, mimeType, prompt) {
  return {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: mimeType,
            data: imageBase64
          }
        }
      ]
    }]
  };
}

async function handleErrorResponse(response, attempt) {
  if (response.status === 401 || response.status === 403) {
    throw new Error('Invalid Gemini API key');
  }
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const waitTime = calculateRateLimitDelay(retryAfter, attempt);
    throw new Error(`RATE_LIMIT:${waitTime}`);
  }
  throw new Error(`Gemini API call failed with status: ${response.status}`);
}

async function handleRateLimitError(error, attempt) {
  const waitTime = parseInt(error.message.split(':')[1]) || 10000;
  if (attempt >= MAX_RETRY_ATTEMPTS) {
    throw new Error('Rate limit exceeded. Please wait before trying again.');
  }
  await new Promise(resolve => setTimeout(resolve, waitTime));
}

function extractImageFromResponse(result, originalSrc) {
  if (!result.candidates?.[0]?.content?.parts) return null;
  for (const part of result.candidates[0].content.parts) {
    const imageData = part.inline_data?.data || part.inlineData?.data;
    if (imageData) return { base64Image: imageData, originalSrc };
  }
  return null;
}
