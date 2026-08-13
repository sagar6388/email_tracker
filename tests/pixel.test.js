import { describe, it, expect } from 'vitest';

describe('TRANSPARENT_GIF', () => {
  it('is a valid 1x1 GIF89a image', async () => {
    const { TRANSPARENT_GIF } = await import('../lib/pixel.js');
    expect(TRANSPARENT_GIF.length).toBe(34);
    expect(TRANSPARENT_GIF.slice(0, 6).toString('ascii')).toBe('GIF89a');
    expect(TRANSPARENT_GIF.readUInt16LE(6)).toBe(1);
    expect(TRANSPARENT_GIF.readUInt16LE(8)).toBe(1);
  });
});

describe('pixelResponse', () => {
  it('returns a Response with image/gif content type and no-cache headers', async () => {
    const { pixelResponse, TRANSPARENT_GIF } = await import('../lib/pixel.js');
    const res = pixelResponse();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    expect(res.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.equals(TRANSPARENT_GIF)).toBe(true);
  });
});
