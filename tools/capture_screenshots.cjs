// SPDX-License-Identifier: LGPL-3.0-or-later
// Capture real listing images. This writes fictional data: use a disposable DB.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const origin = process.env.NEO_TEST_URL;
const db = process.env.NEO_TEST_DB;
assert.ok(origin && db && process.env.NEO_ALLOW_TEST_WRITES === '1',
    'Set NEO_TEST_URL, NEO_TEST_DB and NEO_ALLOW_TEST_WRITES=1 for a disposable database');
const output = path.resolve(__dirname, '../neobrutalism_theme/static/description');

(async () => {
    const manifest = await fs.readFile(path.join(__dirname, '../neobrutalism_theme/__manifest__.py'), 'utf8');
    const major = Number(manifest.match(/"version":\s*"(\d+)\./)[1]);
    const actionUrl = (action, menuId) => major < 18 ? `${origin}/web#action=${action}&view_type=list${menuId ? `&menu_id=${menuId}` : ''}`
        : `${origin}/odoo/action-${action}`;
    const channelModel = major === 16 ? 'mail.channel' : 'discuss.channel';
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
        const menuRecords = await rpc('ir.model.data', 'search_read', [[
            ['module', 'in', ['contacts', 'mail']], ['name', 'in', ['menu_contacts', 'menu_root_discuss']],
        ], ['name', 'res_id']]);
        const menus = Object.fromEntries(menuRecords.map(item => [item.name, item.res_id]));
        const [admin] = await rpc('res.users', 'search_read', [[['login', '=', 'admin']], ['partner_id']]);
        const userFields = await rpc('res.users', 'fields_get', [['tour_enabled']]);
        if (userFields.tour_enabled) {
            await rpc('res.users', 'write', [[admin.id], {tour_enabled: false}]);
        }
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
            res_model: 'res.partner', view_mode: major < 18 ? 'tree,kanban,form' : 'list,kanban,form',
            domain: JSON.stringify([['id', 'in', contacts]])}]);
        await page.goto(actionUrl('contacts.action_contacts'));
        await page.waitForSelector('.o_list_renderer, .o_kanban_renderer');
        await page.goto(actionUrl(action, menus.menu_contacts));
        await page.waitForSelector('.o_list_table .o_data_row');
        await setMode('light');
        await page.waitForSelector('.o_list_table .o_data_row');
        await capture('backend-list.png');
        await setMode('dark');
        await page.waitForSelector('.o_list_table .o_data_row');
        await capture('night-mode.png');
        await setMode('light');
        await page.locator('.o_list_table .o_data_row').first().click();
        await page.waitForSelector('.o_form_sheet');
        await page.locator(major === 16 ? '.o_Message_prettyBody' : '.o-mail-Message-body').first().waitFor();
        await capture('contact-form.png');
        await page.goto(actionUrl(action, menus.menu_contacts));
        await page.locator('.o_switch_view.o_kanban').click();
        await page.waitForSelector('.o_kanban_record');
        await capture('contacts-kanban.png');
        await page.locator('.o_user_menu button').click();
        await page.getByText('Appearance', {exact: true}).click();
        await page.locator('.o_neo_appearance').waitFor();
        await capture('personal-appearance.png');
        await page.getByRole('button', {name: 'Done', exact: true}).click();
        await page.goto(actionUrl('neobrutalism_theme.action_neo_theme_settings'));
        await page.waitForSelector('[name=neo_accent_preset]');
        await capture('admin-presets.png');
        const authors = await rpc('res.partner', 'create', [[{name:'Maya Chen'}, {name:'Alex Rivera'}]]);
        const channel = await rpc(channelModel, 'create', [{name:'Studio / delivery', channel_type:'channel',
            channel_partner_ids: [[4,admin.partner_id[0]], ...authors.map(id=>[4,id])]}]);
        const conversation = [
            [authors[1], 'The Acorn Studio brief is ready for tomorrow. All twelve client contacts are up to date.'],
            [authors[0], 'Thanks, Alex. I have checked the delivery details and added the final notes.'],
            [admin.partner_id[0], 'Great. Let us use the 10:00 review to walk through the handoff together.'],
            [authors[1], 'The customer list and kanban cards are ready. Nothing else is needed before the review.'],
            [authors[0], 'I will take the presentation. Please send any final changes here this evening.'],
            [admin.partner_id[0], 'All set from my side. See you in the morning!'],
        ];
        await rpc('mail.message', 'create', [conversation.map(([author_id,body],i)=>({
            model:channelModel,res_id:channel,author_id,body:`<p>${body}</p>`,message_type:'comment',
            date:new Date(Date.now()-(conversation.length-i)*60000).toISOString().slice(0,19).replace('T',' '),
        }))]);
        await setMode('dark');
        await page.setViewportSize({width:1440,height:800});
        await page.goto(major < 18 ? `${origin}/web#action=mail.action_discuss&active_id=${channelModel}_${channel}&menu_id=${menus.menu_root_discuss}`
            : `${origin}/odoo/discuss?active_id=${channelModel}_${channel}`);
        if (major === 16) {
            await page.reload();
            await page.locator('.o_DiscussSidebar').getByText('Studio / delivery', {exact: true}).last().click();
        }
        await page.getByText('All set from my side. See you in the morning!', {exact:true}).waitFor();
        await capture('discuss-night.png');
        await page.setViewportSize({width:1440,height:960});
        // Real preset screenshots are source material for the animated listing.
        const presetOutput = path.join(__dirname, 'marketplace/screens');
        await fs.mkdir(presetOutput, {recursive: true});
        await page.locator('.o_navbar_apps_menu button').first().click();
        await page.locator('[data-menu-xmlid="contacts.menu_contacts"]').click();
        await page.waitForSelector('.o_list_renderer, .o_kanban_renderer');
        await page.goto(actionUrl(action, menus.menu_contacts));
        await page.waitForSelector('.o_list_table .o_data_row');
        await setMode('light');
        for (const preset of ['yellow', 'blue', 'green', 'purple', 'pink', 'orange', 'red']) {
            const config = await rpc('res.config.settings', 'create', [{neo_accent_preset: preset}]);
            await rpc('res.config.settings', 'set_values', [[config]]);
            await page.reload();
            await page.waitForSelector('.o_list_table .o_data_row');
            assert.equal((await page.locator('.o_menu_brand').innerText()).trim(), 'Contacts');
            await page.evaluate(() => document.activeElement?.blur());
            await page.screenshot({path: path.join(presetOutput, `preset-${preset}.png`), animations: 'disabled'});
            console.log(`Captured preset-${preset}.png`);
        }
        const restore = await rpc('res.config.settings', 'create', [{neo_accent_preset: 'yellow'}]);
        await rpc('res.config.settings', 'set_values', [[restore]]);
        assert.deepEqual(errors, []);
        await page.setViewportSize({width: 1120, height: 560});
        const coverURL = pathToFileURL(path.join(__dirname, 'cover.html'));
        coverURL.searchParams.set('odoo', String(major));
        await page.goto(coverURL.href);
        assert.ok(await page.locator('img').evaluateAll(images =>
            images.every(image => image.complete && image.naturalWidth > 0)));
        await capture('cover.png');
    } finally {
        await browser.close();
    }
})().catch(error => {console.error(error); process.exit(1);});
