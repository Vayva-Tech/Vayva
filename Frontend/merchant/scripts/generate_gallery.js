"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var core_1 = require("../src/lib/email/templates/core");
// Mock Data for Core Templates
var MOCKS = {
    auth_otp_verification: { otp: '482-931', first_name: 'Adewale' },
    auth_welcome: { first_name: 'Chioma', store_name: 'Luxe Lagos', dashboard_url: 'https://merchant.vayva.ng/dashboard' },
    auth_password_reset: { reset_link: 'https://merchant.vayva.ng/reset-password?token=abc' },
    billing_receipt: { store_name: 'Luxe Lagos', amount: '45,000.00', currency: 'NGN', invoice_number: 'INV-2024-001', date: 'Dec 27, 2024', billing_url: 'https://merchant.vayva.ng/dashboard/settings/billing' },
    team_invite: { inviter_name: 'Adewale', store_name: 'Luxe Lagos', role: 'Admin', invite_url: 'https://merchant.vayva.ng/invite/mock', role_description: 'Full access to store settings and orders.' }
};
var OUTPUT_PATH = path_1.default.join(process.cwd(), 'public', 'email_previews.html');
function generate() {
    var galleryItems = Object.entries(core_1.Templates).map(function (_a) {
        var key = _a[0], renderFn = _a[1];
        var data = MOCKS[key] || {};
        var html = renderFn(data);
        return { key: key, html: html, subject: 'Subject Preview' };
    });
    var html = "\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Vayva Email Gallery</title>\n    <style>\n        body { font-family: -apple-system, sans-serif; background: #111; color: white; margin: 0; padding: 20px; }\n        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(600px, 1fr)); gap: 40px; }\n        .card { background: #222; border-radius: 12px; overflow: hidden; border: 1px solid #333; }\n        .header { padding: 12px 20px; background: #000; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }\n        .title { font-weight: bold; color: #22C55E; }\n        .meta { font-size: 12px; color: #888; }\n        iframe { width: 100%; height: 800px; border: none; background: white; }\n    </style>\n</head>\n<body>\n    <h1 style=\"margin-bottom: 40px;\">Vayva Luxury Email System <span style=\"font-size: 14px; font-weight:normal; color: #666; margin-left: 20px;\">Premium Templates</span></h1>\n    <div class=\"grid\" id=\"grid\"></div>\n    <script>\n        const templates = ".concat(JSON.stringify(galleryItems), ";\n        const grid = document.getElementById('grid');\n        \n        templates.forEach(t => {\n            const card = document.createElement('div');\n            card.className = 'card';\n            card.innerHTML = `\n                <div class=\"header\">\n                    <div class=\"title\">${t.key}</div>\n                    <div class=\"meta\">${t.subject}</div>\n                </div>\n                <iframe srcdoc=\"${t.html.replace(/\"/g, '&quot;')}\" loading=\"lazy\"></iframe>\n            `;\n            grid.appendChild(card);\n        });\n    </script>\n</body>\n</html>\n    ");
    fs_1.default.writeFileSync(OUTPUT_PATH, html);
    console.log("Gallery generated at ".concat(OUTPUT_PATH));
}
generate();
