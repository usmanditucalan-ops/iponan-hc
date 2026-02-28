const fs = require('fs');
const file = 'web/src/components/layout/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// The block to replace
const languageBlockRegex = /<div className="p-4 pb-6 space-y-3">[\s\S]*?<\/div>\s*<\/div>/;

// The block we want to put there
const newLogoutBlock = `
        <div className="p-4 pb-6 mt-auto border-t border-border dark:border-dark-border">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 font-bold text-sm focus:ring-2 focus:ring-red-600 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-dark-surface-primary outline-none"
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
`;

content = content.replace(languageBlockRegex, newLogoutBlock.trim());

// Remove the old logout button inside nav
const oldLogoutRegex = /<button[\s\S]*?onClick=\{\(\) => \{\s*logout\(\);\s*navigate\('\/login'\);\s*\}\}[\s\S]*?className="w-full flex items-center gap-3 px-3 py-2 rounded text-red-500[\s\S]*?<\/button>/;

content = content.replace(oldLogoutRegex, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Sidebar replaced successfully.');
