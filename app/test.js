import supertest from 'supertest';

import test from 'ava';

import app from '.';

const req = supertest(app);

test('index', async (t) => {
  t.plan(2);

  const res = await req.get('/');

  t.is(res.status, 200);
  t.is(res.text, 'Hello World!');
});
