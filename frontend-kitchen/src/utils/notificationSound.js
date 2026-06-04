const SOUND_SOURCE = '/notification.mp3';

let audioContext = null;
let audioBuffer = null;
let loadPromise = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

async function fetchBuffer(url) {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }

  return response.arrayBuffer();
}

async function ensureBuffer() {
  if (audioBuffer) return audioBuffer;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ctx = getAudioContext();
    if (!ctx) {
      throw new Error('AudioContext unavailable');
    }

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const arrayBuffer = await fetchBuffer(SOUND_SOURCE);
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    audioBuffer = decoded;
    return decoded;
  })();

  return loadPromise;
}

export async function unlockNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  try {
    await ensureBuffer();
    return true;
  } catch {
    return false;
  }
}

export async function playNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const buffer = await ensureBuffer();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  return true;
}
