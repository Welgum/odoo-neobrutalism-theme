// SPDX-License-Identifier: LGPL-3.0-or-later
// Render original HTML layouts around actual Odoo screenshots; encode with FFmpeg.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {spawnSync} = require('node:child_process');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'neobrutalism_theme/static/description');
const scratch = path.join(root, 'dist/marketplace-frames');
const speed = 3;
const fps = 30;
const jobs = [
    {name:'cover', source:'tools/cover.html', width:1120, height:560, seconds:9},
    {name:'day-night-demo', source:'tools/marketplace/motion.html', width:1120, height:760, seconds:8},
    {name:'accent-demo', source:'tools/marketplace/motion.html', query:'?type=accents', width:1120, height:760, seconds:14},
];
(async()=>{
    const browser = await chromium.launch({headless:true,...(process.env.NEO_CHROME_PATH
        ? {executablePath:process.env.NEO_CHROME_PATH}: {})});
    try {
        const page = await browser.newPage({deviceScaleFactor:1});
        const errors=[];page.on('pageerror',error=>errors.push(error.message));
        for (const job of jobs) {
            const frameCount = Math.round(job.seconds / speed * fps);
            const finalDelay = Math.round(job.seconds / speed * 100) - Math.round((frameCount - 1) / fps * 100);
            const frames=path.join(scratch,job.name);
            await fs.mkdir(frames,{recursive:true});
            await page.setViewportSize({width:job.width,height:job.height});
            await page.goto(pathToFileURL(path.join(root,job.source)).href+(job.query||''));
            await page.evaluate(()=>document.fonts.ready);
            for(let frame=0;frame<frameCount;frame++){
                await page.evaluate(t=>window.renderFrame(t),frame/fps*speed);
                await page.screenshot({path:path.join(frames,`${String(frame).padStart(4,'0')}.png`)});
            }
            const result=spawnSync(process.env.NEO_FFMPEG||'ffmpeg',[
                '-hide_banner','-loglevel','error','-y','-framerate',String(fps),
                '-i',path.join(frames,'%04d.png'),'-frames:v',String(frameCount),
                '-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
                '-loop','0','-final_delay',String(finalDelay),path.join(output,`${job.name}.gif`),
            ],{encoding:'utf8'});
            assert.equal(result.status,0,result.stderr);
            await fs.copyFile(path.join(frames,'0000.png'),path.join(output,`${job.name}.png`));
            const bytes=(await fs.stat(path.join(output,`${job.name}.gif`))).size;
            console.log(`${job.name}.gif: ${job.width}×${job.height}, ${(job.seconds/speed).toFixed(2)}s loop, ${(bytes/1024).toFixed(0)} KiB`);
        }
        assert.deepEqual(errors,[]);
    } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
