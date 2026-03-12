/* eslint-disable */
const fs = require('fs');
const path = require('path');

const dirs = [
    'apps/merchant-admin/src',
    'packages/policies/src'
];

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = dirs.flatMap(walk);

const replacements = [
    { from: /\(e: unknown\)/g, to: '(e: any)' },
    { from: /\(e:unknown\)/g, to: '(e: any)' },
    { from: /\(_e: unknown\)/g, to: '(_e: any)' },
    { from: /catch \(error\)/g, to: 'catch (error: any)' },
    { from: /catch \(e\)/g, to: 'catch (e: any)' },
    { from: /: unknown\)/g, to: ': any)' }, // Catch-all for function parameters
    { from: /: unknown[]\)/g, to: ': any[])' },
    { from: /=> unknown/g, to: '=> any' },
    { from: /_storeName/g, to: 'storeName' },
    { from: /_merchantSupportWhatsApp/g, to: 'merchantSupportWhatsApp' },
    { from: /_supportEmail/g, to: 'supportEmail' },
    { from: /_pickupAddress/g, to: 'pickupAddress' },
    { from: /_deliveryCities/g, to: 'deliveryCities' },
    { from: /_returnsWindowDays/g, to: 'returnsWindowDays' },
    { from: /_refundWindowDays/g, to: 'refundWindowDays' },
    { from: /_dispatchMode/g, to: 'dispatchMode' },
    { from: /_partnerName/g, to: 'partnerName' },
    { from: /_redirect/g, to: 'redirect' }, // More generic botch fixes
    { from: /_prisma/g, to: 'prisma' },
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated: ${file}`);
    }
});
