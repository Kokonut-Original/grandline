// server/tests/run.js
// Trinh chay test tu dong: quet va thuc thi toan bo file *.test.js trong server/tests/.
// Phu thuoc: fs, path, cac file *.test.js.

'use strict';

const fs = require('fs');
const path = require('path');

const TESTS_DIR = __dirname;

async function runAllTests() {
  console.log('=== DANG CHAY SERVER UNIT TESTS ===');

  const files = fs.readdirSync(TESTS_DIR).filter(f => f.endsWith('.test.js'));
  if (files.length === 0) {
    console.log('Khong tim thay file *.test.js nao trong server/tests/');
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const testPath = path.join(TESTS_DIR, file);
    const testModule = require(testPath);
    const testName = testModule.name || file;

    process.stdout.write(`- Dang chay: ${testName} (${file})... `);
    try {
      if (typeof testModule.run === 'function') {
        const result = testModule.run();
        if (result && typeof result.then === 'function') {
          await result;
        }
      }
      console.log('PASS');
      passed++;
    } catch (err) {
      console.log('FAIL');
      console.error(`  Chi tiet loi trong ${file}:`, err.message);
      if (err.stack) {
        console.error(err.stack.split('\n').slice(1, 4).join('\n'));
      }
      failed++;
    }
  }

  console.log('='.repeat(35));
  console.log(`Tong ket: ${passed} PASS, ${failed} FAIL / Tong so ${files.length} test`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Loi bat ngo trong run.js:', err);
  process.exit(1);
});
