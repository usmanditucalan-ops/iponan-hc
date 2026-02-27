const fs = require('fs');
const path = require('path');

const DIRS_TO_SCAN = ['web/src', 'mobile/app', 'mobile/components', 'mobile/context', 'mobile/hooks', 'mobile/constants'];

// Map of standard tailwind border radius names to the next smaller one
const REDUCE_MAP = {
  '3xl': '2xl',
  '2xl': 'xl',
  'xl': 'lg',
  'lg': 'md',
  'md': '', // -> rounded
  '': 'sm',
  'sm': 'none'
};

function reduceArbitraryValue(valStr) {
  // valStr looks like "[3rem]" or "[20px]"
  const numMatch = valStr.match(/\[([\d\.]+)(rem|px)\]/);
  if (!numMatch) return valStr;
  
  let val = parseFloat(numMatch[1]);
  let unit = numMatch[2];
  
  // Reduce value by roughly 25-30%
  if (unit === 'rem') {
    val = val * 0.7;
    // Special rounding to neat numbers if possible
    val = Math.round(val * 4) / 4; // nearest 0.25
  } else if (unit === 'px') {
    val = Math.round(val * 0.7);
  }
  
  return `[${val}${unit}]`;
}

function processContent(content) {
  // This regex matches class names like:
  // rounded-3xl
  // rounded-t-2xl
  // rounded-[3rem]
  // rounded-tr-[24px]
  // Note: it uses lookarounds or simple bounds to ensure we match whole class names
  // Classes are bounded by spaces, quotes, backticks, or newlines.
  
  const regex = /(?<=['"`\s])(rounded(?:-[tblr]{1,2})?)-([a-zA-Z0-9\.\[\]]+)(?=['"`\s])/g;
  
  // Also we need to catch the plain "rounded" case which has no dash suffix
  // e.g. "rounded"
  const plainRegex = /(?<=['"`\s])(rounded(?:-[tblr]{1,2})?)(?=['"`\s])/g;
  
  let newContent = content.replace(regex, (match, prefix, suffix) => {
    // Exclude rounded-full completely
    if (suffix === 'full') return match;
    
    // Check if it's an arbitrary value
    if (suffix.startsWith('[')) {
      const newSuffix = reduceArbitraryValue(suffix);
      return `${prefix}-${newSuffix}`;
    }
    
    // Standard size
    if (REDUCE_MAP.hasOwnProperty(suffix)) {
      const newSuffix = REDUCE_MAP[suffix];
      if (newSuffix === '') {
        return prefix; // e.g., rounded-md -> rounded
      } else {
        return `${prefix}-${newSuffix}`;
      }
    }
    
    return match;
  });
  
  // Now handle plain "rounded" -> "rounded-sm"
  newContent = newContent.replace(plainRegex, (match, prefix) => {
     // Because the first regex might have generated 'rounded', we shouldn't do this in two sequential replaces blindly unless we check.
     // Let's actually skip changing "rounded" to "rounded-sm" to avoid over-squaring the basic ones,
     // or just do it inside a safe regex. 
     // For safety, let's just stick to the first regex which targets explicit sizes. The standard sizes were the problem anyway.
     return match;
  });
  
  // Let's do a standalone pass for exact "rounded" matching to "rounded-sm" to satisfy "reduce all"
  // Wait, if I do `newContent.replace(/(?<=['"`\s])(rounded(?:-[tblr]{1,2})?)(?=['"`\s])/g, '$1-sm')` 
  // it would turn "rounded" into "rounded-sm".
  // But since I just mapped "rounded-md" to "rounded" above, doing it sequentially would double-shrink "rounded-md" to "rounded-sm".
  // It's safer to just do a single pass splitting by word/token boundaries.
  
  return content.replace(/(?<=['"`\s])(rounded(?:-[tblr]{1,2})?)(?:-([a-zA-Z0-9\.\[\]]+))?(?=['"`\s])/g, (match, prefix, suffix) => {
     if (suffix === 'full' || suffix === 'none' || suffix === 'sm') return match;
     
     if (!suffix) {
        // Plain "rounded" matches here. Note: prefix is like "rounded" or "rounded-t"
        return `${prefix}-sm`;
     }
     
     if (suffix.startsWith('[')) {
         return `${prefix}-${reduceArbitraryValue(suffix)}`;
     }
     
     if (REDUCE_MAP.hasOwnProperty(suffix)) {
        const newSuffix = REDUCE_MAP[suffix];
        return newSuffix ? `${prefix}-${newSuffix}` : prefix;
     }
     
     return match;
  });
}

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;

DIRS_TO_SCAN.forEach(directory => {
  walkDir(directory, function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      let newContent = processContent(content);

      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        modifiedFiles++;
        console.log('Updated:', filePath);
      }
    }
  });
});

console.log(`Done. Modified ${modifiedFiles} files.`);
