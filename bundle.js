const fs = require('fs');
const path = require('path');

const simDir = 'C:\\\\Users\\\\a\\\\OneDrive\\\\Desktop\\\\과학웹\\\\시뮬레이션\\\\힘과 가속도,운동량 보존';
const appJsPath = 'C:\\\\Users\\\\a\\\\OneDrive\\\\Desktop\\\\과학웹\\\\all science\\\\app.js';

let html = fs.readFileSync(path.join(simDir, 'index.html'), 'utf-8');
const css = fs.readFileSync(path.join(simDir, 'style.css'), 'utf-8');
const js = fs.readFileSync(path.join(simDir, 'script.js'), 'utf-8');

html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>');
html = html.replace('<script src="script.js"></script>', '<script>\n' + js + '\n</script>');

// Escape backticks and ${}
const escapedHtml = html.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const newTemplate = `
  {
    id: 'sim-mechanics-01',
    name: '역학 및 운동 법칙 시뮬레이션',
    author: 'All Science',
    description: '힘과 가속도(F=ma) 및 운동량 보존과 충돌을 다루는 인터랙티브 물리 시뮬레이션입니다.',
    category: 'physics',
    imageStyle: 'model',
    views: 12500,
    likes: 430,
    code: \`${escapedHtml}\`
  }
`;

let appJs = fs.readFileSync(appJsPath, 'utf-8');
appJs = appJs.replace('const DEFAULT_TEMPLATES = [];', 'const DEFAULT_TEMPLATES = [' + newTemplate + '];');

fs.writeFileSync(appJsPath, appJs);
console.log('Bundled and updated app.js');
