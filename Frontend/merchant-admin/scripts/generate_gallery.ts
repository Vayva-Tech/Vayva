import fs from "fs";
import path from "path";
import { Templates } from "../src/lib/email/templates/core";

// Mock Data for Core Templates
const MOCKS = {
  auth_otp_verification: { otp: "482-931", first_name: "Adewale" },
  auth_welcome: {
    first_name: "Chioma",
    store_name: "Luxe Lagos",
    dashboard_url: "https://merchant.vayva.ng/dashboard",
  },
  auth_password_reset: {
    reset_link: "https://merchant.vayva.ng/reset-password?token=abc",
  },
  billing_receipt: {
    store_name: "Luxe Lagos",
    amount: "45,000.00",
    currency: "NGN",
    invoice_number: "INV-2024-001",
    date: "Dec 27, 2024",
    billing_url: "https://merchant.vayva.ng/dashboard/settings/billing",
  },
  team_invite: {
    inviter_name: "Adewale",
    store_name: "Luxe Lagos",
    role: "Admin",
    invite_url: "https://merchant.vayva.ng/invite/mock",
    role_description: "Full access to (store.settings as any) and orders.",
  },
};

const OUTPUT_PATH = path.join(process.cwd(), "public", "email_previews.html");

function generate() {
  const galleryItems = Object.entries(
    Templates as Record<string, (data: any) => string>,
  ).map(([key, renderFn]) => {
    const data = MOCKS[key as keyof typeof MOCKS] || {};
    const html = renderFn(data);
    return { key, html, subject: "Subject Preview" };
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Vayva Email Gallery</title>
    <style>
        body { font-family: -apple-system, sans-serif; background: #111; color: white; margin: 0; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(600px, 1fr)); gap: 40px; }
        .card { background: #222; border-radius: 12px; overflow: hidden; border: 1px solid #333; }
        .header { padding: 12px 20px; background: #000; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }
        .title { font-weight: bold; color: #22C55E; }
        .meta { font-size: 12px; color: #888; }
        iframe { width: 100%; height: 800px; border: none; background: white; }
    </style>
</head>
<body>
    <h1 style="margin-bottom: 40px;">Vayva Luxury Email System <span style="font-size: 14px; font-weight:normal; color: #666; margin-left: 20px;">Premium Templates</span></h1>
    <div class="grid" id="grid"></div>
    <script>
        const templates = ${JSON.stringify(galleryItems)};
        const grid = document.getElementById('grid');
        
        templates.forEach(t => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = \`
                <div class="header">
                    <div class="title">\${t.key}</div>
                    <div class="meta">\${t.subject}</div>
                </div>
                <iframe srcdoc="\${t.html.replace(/"/g, '&quot;')}" loading="lazy"></iframe>
            \`;
            grid.appendChild(card);
        });
    </script>
</body>
</html>
    `;

  fs.writeFileSync(OUTPUT_PATH, html);
  console.log(`Gallery generated at ${OUTPUT_PATH}`);
}

generate();
