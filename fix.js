const fs = require('fs');
let HTML = fs.readFileSync('reward-quiz-app/index.html', 'utf8');
HTML = HTML.replace(
    "(function (s) { s.dataset.zone = '11421912', s.src = 'https://al5sm.com/tag.min.js' })",
    "(function(s){s.dataset.zone='11421912',s.src='https://al5sm.com/tag.min.js'})"
);
fs.writeFileSync('reward-quiz-app/index.html', HTML);
