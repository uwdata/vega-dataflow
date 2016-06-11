var tape = require('tape'),
    dataflow = require('../../');

tape('Field generates field accessors', function(test) {
  var df = new dataflow.Dataflow(),
      n = df.add('foo'),
      f = df.add(dataflow.Field, {name:n});

  df.run();
  test.equal(typeof f.value, 'function');
  test.equal(f.value.fname, 'foo');
  test.deepEqual(f.value.fields, ['foo']);

  df.update(n, 'bar').run();
  test.equal(typeof f.value, 'function');
  test.equal(f.value.fname, 'bar');
  test.deepEqual(f.value.fields, ['bar']);

  test.end();
});
