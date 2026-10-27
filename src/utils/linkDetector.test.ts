import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrl,
  extractDomain,
  detectLinkInfo,
  validateUrlInput
} from './linkDetector';

test('normalizeUrl prepends https:// to bare domains', () => {
  assert.equal(normalizeUrl('google.com'), 'https://google.com');
  assert.equal(normalizeUrl('https://github.com'), 'https://github.com');
  assert.equal(normalizeUrl('http://test.org'), 'http://test.org');
});

test('normalizeUrl preserves app custom schemes', () => {
  assert.equal(normalizeUrl('whatsapp://send?phone=123'), 'whatsapp://send?phone=123');
  assert.equal(normalizeUrl('spotify:track:12345'), 'spotify:track:12345');
  assert.equal(normalizeUrl('tg://resolve?domain=telegram'), 'tg://resolve?domain=telegram');
});

test('extractDomain correctly parses hostnames and app schemes', () => {
  assert.equal(extractDomain('https://www.wikipedia.org/wiki/India'), 'wikipedia.org');
  assert.equal(extractDomain('https://github.com/facebook/react'), 'github.com');
  assert.equal(extractDomain('whatsapp://send?text=hello'), 'whatsapp:// app');
});

test('detectLinkInfo identifies Google Play store apps', () => {
  const result = detectLinkInfo('https://play.google.com/store/apps/details?id=com.spotify.music');
  assert.equal(result.linkType, 'android_app');
  assert.equal(result.platformName, 'Google Play Store');
  assert.equal(result.suggestedCategory, 'Apps & Mobile');
});

test('detectLinkInfo identifies iOS App store links', () => {
  const result = detectLinkInfo('https://apps.apple.com/us/app/instagram/id389801252');
  assert.equal(result.linkType, 'ios_app');
  assert.equal(result.platformName, 'Apple App Store');
  assert.equal(result.suggestedCategory, 'Apps & Mobile');
});

test('detectLinkInfo identifies YouTube media streams', () => {
  const result = detectLinkInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(result.linkType, 'media_stream');
  assert.equal(result.platformName, 'YouTube');
  assert.equal(result.suggestedCategory, 'Entertainment');
});

test('validateUrlInput correctly accepts valid and rejects empty/malformed URLs', () => {
  assert.equal(validateUrlInput('').isValid, false);
  assert.equal(validateUrlInput('    ').isValid, false);
  assert.equal(validateUrlInput('notaurlwithoutdot').isValid, false);
  assert.equal(validateUrlInput('example.com').isValid, true);
  assert.equal(validateUrlInput('https://news.ycombinator.com').isValid, true);
  assert.equal(validateUrlInput('whatsapp://chat').isValid, true);
});
