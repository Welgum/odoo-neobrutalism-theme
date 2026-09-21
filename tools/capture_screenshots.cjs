// SPDX-License-Identifier: LGPL-3.0-or-later
// Capture real listing images. This writes fictional data: use a disposable DB.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const origin = process.env.NEO_TEST_URL;
const db = process.env.NEO_TEST_DB;
assert.ok(origin && db && process.env.NEO_ALLOW_TEST_WRITES === '1',
    'Set NEO_TEST_URL, NEO_TEST_DB and NEO_ALLOW_TEST_WRITES=1 for a disposable database');
const output = path.resolve(__dirname, '../neobrutalism_theme/static/description');

(async () => {
    const browser = await chromium.launch({headless: true, ...(process.env.NEO_CHROME_PATH
        ? {executablePath: process.env.NEO_CHROME_PATH} : {})});
    try {
        const page = await browser.newPage({viewport: {width: 1440, height: 960}, deviceScaleFactor: 1});
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${origin}/web/login?db=${encodeURIComponent(db)}`);
        await page.locator('[name=login]').fill('admin');
        await page.locator('[name=password]').fill('admin');
        await page.getByRole('button', {name: 'Log in', exact: true}).click();
        await page.waitForSelector('.o_neo_mode_toggle button', {timeout: 90000});
        const rpc = async (model, method, args) => {
            const reply = await page.evaluate(async ({model, method, args}) => (await fetch(
                `/web/dataset/call_kw/${model}/${method}`, {method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({jsonrpc: '2.0', method: 'call', id: 1,
                        params: {model, method, args, kwargs: {}}})})).json(), {model, method, args});
            assert.ok(!reply.error, JSON.stringify(reply.error));
            return reply.result;
        };
        const setMode = async mode => {
            if (await page.locator('body').getAttribute('data-neo-mode') !== mode) {
                await page.locator('.o_neo_mode_toggle button').click();
            }
            await page.waitForSelector(`body[data-neo-mode=${mode}]`, {timeout: 90000});
        };
        const capture = async filename => {
            await page.evaluate(() => document.fonts.ready);
            await page.waitForFunction(() => [...document.images].every(image =>
                !image.getClientRects().length || (image.complete && image.naturalWidth > 0)));
            await page.mouse.move(1430, 950);
            await page.screenshot({path: path.join(output, filename), animations: 'disabled'});
            console.log(`Captured ${filename}`);
        };
        const settings = await rpc('res.config.settings', 'create', [{neo_accent_preset: 'yellow'}]);
        await rpc('res.config.settings', 'set_values', [[settings]]);
        // Shared accent settings are read into the session on page load.
        await page.reload();
        await page.waitForSelector('.o_neo_mode_toggle button');
        const names = ['Acorn Studio', 'Atlas Workshop', 'Birch & Co.', 'Brightside Design',
            'Cedar Supply', 'Copper Lane', 'Fieldwork Labs', 'Harbor Collective',
            'Juniper Works', 'Northstar Studio', 'Paperplane Creative', 'Willow Partners'];
        const cities = ['Amsterdam', 'Berlin', 'Copenhagen', 'Dublin', 'Helsinki', 'Lisbon',
            'London', 'Oslo', 'Paris', 'Stockholm', 'Vienna', 'Warsaw'];
        const contacts = await rpc('res.partner', 'create', [names.map((name, i) => ({
            name, is_company: true, city: cities[i], street: `${12 + i} Market Street`,
            email: `hello@${name.toLowerCase().replace(/[^a-z]/g, '')}.example`,
            phone: `+1 202 555 ${String(100 + i).padStart(4, '0')}`,
        }))]);
        const action = await rpc('ir.actions.act_window', 'create', [{name: 'Contacts',
            res_model: 'res.partner', view_mode: 'tree,kanban,form',
            domain: JSON.stringify([['id', 'in', contacts]])}]);
        await page.goto(`${origin}/web#action=contacts.action_contacts`);
        await page.waitForSelector('.o_list_renderer, .o_kanban_renderer');
        await page.goto(`${origin}/web#action=${action}&view_type=list`);
        await page.waitForSelector('.o_list_table .o_data_row');
        await setMode('light');
        await capture('backend_screenshot.png');
        await setMode('dark');
        await capture('night-mode.png');
        await setMode('light');
        await page.locator('.o_list_table .o_data_row').first().click();
        await page.waitForSelector('.o_form_sheet');
        await page.locator('.o-mail-Message-body').first().waitFor();
        await capture('contact-form.png');
        await page.goto(`${origin}/web#action=${action}&view_type=list`);
        await page.locator('.o_switch_view.o_kanban').click();
        await page.waitForSelector('.o_kanban_record');
        await capture('contacts-kanban.png');
        await page.locator('.o_user_menu button').click();
        await page.getByText('Appearance', {exact: true}).click();
        await page.locator('.o_neo_appearance').waitFor();
        await capture('personal-appearance.png');
        await page.getByRole('button', {name: 'Done', exact: true}).click();
        await page.goto(`${origin}/web#action=neobrutalism_theme.action_neo_theme_settings`);
        await page.waitForSelector('[name=neo_accent_preset]');
        await capture('admin-presets.png');
        await setMode('dark');
        await page.locator('.o_navbar_apps_menu .dropdown-toggle').click();
        await page.locator('[data-menu-xmlid="mail.menu_root_discuss"]').click();
        await page.locator('.o-mail-DiscussSidebar').getByText('OdooBot', {exact: true}).click();
        await page.locator('.o-mail-Message-body').first().waitFor();
        await capture('discuss-night.png');
        assert.deepEqual(errors, []);
        await page.setViewportSize({width: 1120, height: 560});
        await page.goto(pathToFileURL(path.join(__dirname, 'cover.html')).href);
        assert.ok(await page.locator('img').evaluateAll(images =>
            images.every(image => image.complete && image.naturalWidth > 0)));
        await capture('cover.png');
    } finally {
        await browser.close();
    }
})().catch(error => {console.error(error); process.exit(1);});
