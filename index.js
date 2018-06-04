const getOktaCodeFromPhone = require('./src/get_okta_code_from_phone.js');
const { spawn } = require('child_process');

function main() {
  console.log('Running openconnect autofill...');
  if (!(process.env.AF_USER && process.env.AF_PASS && process.env.AF_HOST && process.env.AF_SERVERCERT && process.env.AF_AUTHGROUP && process.env.AF_PBACCESSTOKEN)) {
    console.error('You must provide the env variables AF_USER, AF_PASS, AF_HOST, AF_SERVERCERT, AF_AUTHGROUP');
    return;
  }
  console.log('Waiting to enter password...');
  const openConnect = execOpenConnect(process.env.AF_USER, process.env.AF_HOST, process.env.AF_SERVERCERT, process.env.AF_AUTHGROUP);
  openConnect.stderr.on('data', async (data)=> {
    if (data.indexOf('Password:') > -1) {
      openConnect.stdin.write(`process.env.AF_PASS\n`);
      console.log('Successfully entered password!');
    }
    if (data.indexOf('Response:') === 0) {
      const code = await getOktaCodeFromPhone(process.env.AF_PBACCESSTOKEN);
      openConnect.stdin.write(`${code}\n`);
      console.log('Successfully entered 2FA code!');
      console.log(`You\'ve successfully connected to ${process.env.AF_HOST} VPN.`);
    }
  });
}

function execOpenConnect(user, address, serverCert='', authGroup) {
  return spawn(`openconnect`, [`--authgroup=${authGroup}`, `--user=${user}`, `--printcookie`, `--servercert`, serverCert, address]);
}

main();
