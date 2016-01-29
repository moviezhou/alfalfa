var childProcess = require('child_process'),
     cmd;

 cmd = childProcess.exec('node stream-server.js 123', function (error, stdout, stderr) {
   if (error) {
     console.log(error.stack);
     console.log('Error code: '+error.code);
     console.log('Signal received: '+error.signal);
   }
   console.log('Child Process STDOUT: '+stdout);
   console.log('Child Process STDERR: '+stderr);
 });

 cmd.on('exit', function (code) {
   console.log('Child process exited with exit code '+code);
 });