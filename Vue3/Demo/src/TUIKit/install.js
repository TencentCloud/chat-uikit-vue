/* eslint-disable no-useless-escape */
const os = require('os');
const process = require('child_process');

const cmdMac = `mkdir -p ../../../src/TUIKit && rsync -av --exclude={'node_modules','package.json','excluded-list.txt'} ./ ../../../src/TUIKit`;
const cmdWin = `xcopy .\ ..\..\..\src\TUIKit /i /e /exclude:.\excluded-list.txt`;
const cmd = os.platform() === 'darwin' ? cmdMac : cmdWin;

(function () {
  process.exec(cmd, (error) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`TUIKit has copyed to src/TUIKit`);
  });
})();
