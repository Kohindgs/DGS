import test from 'node:test';
import assert from 'node:assert/strict';
import { clearFormContextCache, fetchFormContext } from '../lib/forms/form-context.mjs';

const definition = {
  fluentFormId: 3,
  backend: { wordpressPageIds: { '/services/test/': 123 } },
};
const html = '<form id="fluentform_3"><input name="_fluentform_3_fluentformnonce" value="abc123"><input name="__fluent_form_embded_post_id" value="123"></form>';

test('headless form-context API is preferred over WordPress frontend page', async () => {
  clearFormContextCache();
  const urls = [];
  const fetchMock = async (input) => {
    urls.push(String(input));
    return { ok: true, json: async () => ({ html }) };
  };
  const result = await fetchFormContext(definition, '/services/test/', fetchMock, true);
  assert.equal(result.ok, true);
  assert.equal(urls.length, 1);
  assert.match(urls[0], /\/wp-json\/dgs\/v1\/form-context/);
  assert.match(urls[0], /form_id=3/);
  assert.match(urls[0], /post_id=123/);
});

test('legacy WordPress page lookup remains a temporary migration fallback', async () => {
  clearFormContextCache();
  const urls = [];
  const fetchMock = async (input) => {
    const url = String(input);
    urls.push(url);
    if (url.includes('/wp-json/dgs/v1/form-context')) {
      return { ok: false, status: 404, json: async () => ({}) };
    }
    return { ok: true, text: async () => html };
  };
  const result = await fetchFormContext(definition, '/services/test/', fetchMock, true);
  assert.equal(result.ok, true);
  assert.equal(urls.length, 2);
  assert.match(urls[0], /\/wp-json\/dgs\/v1\/form-context/);
  assert.match(urls[1], /\/services\/test\/$/);
});
