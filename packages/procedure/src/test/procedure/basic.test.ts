import {createId} from '../../library';

test('create 8 length of nanoid', () => {
  expect(String(createId()).length).toBe(8);
});
