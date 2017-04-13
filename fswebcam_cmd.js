function execute(cmd, args, onEnd) {
  var spawn = require('child_process').spawn
    , child = spawn(cmd, args)
    , me = this;
  me.stdout = '';
  me.stderr = '';
  child.stdout.on('data', function (data) { me.stdout += data.toString(); });
  child.stderr.on('data', function (data) { me.stderr += data.toString(); });
  child.stdout.on('end', function () { onEnd(me) });
}
new execute(
    'fswebcam'
  , ['--no-banner', './fswebcam_test.jpg']
  , function (me) {
    console.log('--- stdout ---');
    console.log(me.stdout);
    console.error('--- stderr ---');
    console.error(me.stderr);
  });
