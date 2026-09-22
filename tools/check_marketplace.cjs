// SPDX-License-Identifier: LGPL-3.0-or-later
// Inspect actual raster outputs and deterministic HTML compositions. No Odoo DB needed.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const names=await fs.readdir(root);const module=names.find(n=>n==='minimalism_theme'||n==='neobrutalism_theme');
 const manifest=await fs.readFile(path.join(root,module,'__manifest__.py'),'utf8');
 const major=manifest.match(/"version":\s*"(\d+)\./)[1];
 const out=path.join(root,'dist/marketplace-review');await fs.mkdir(out,{recursive:true});
 for(const [name,w,h,seconds] of [['cover',1120,560,3],['theme_screenshot',1000,1210,3],['day-night-demo',1120,760,2.67],['accent-demo',1120,760,4.67]]){
  const file=path.join(root,module,'static/description',name+'.gif');
  const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration:stream=width,height,nb_frames','-of','json',file],{encoding:'utf8'});
  assert.equal(probe.status,0,probe.stderr);const info=JSON.parse(probe.stdout);
  assert.equal(info.streams[0].width,w);assert.equal(info.streams[0].height,h);
  assert.ok(Number(info.streams[0].nb_frames)>1);assert.ok(Math.abs(Number(info.format.duration)-seconds)<.02);
  const decoded=spawnSync('ffmpeg',['-v','error','-i',file,'-f','null','-'],{encoding:'utf8'});assert.equal(decoded.status,0,decoded.stderr);
 }
 const executablePath=process.env.MIN_CHROME_PATH||process.env.NEO_CHROME_PATH;
 const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const remote=[];page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  for(const [name,file,query,width,height,times] of [
   ['cover','tools/cover.html','',1120,560,[0,3.9,6.9,9]],
   ['thumbnail','tools/cover.html','format=thumbnail',1000,1210,[0,3.9,6.9,9]],
   ['day-night','tools/marketplace/motion.html','',1120,760,[0,3.25,4,7.5]],
   ['accent','tools/marketplace/motion.html','type=accents',1120,760,[0,2,4,6,8,10,12]],
  ]){
   const url=new URL(pathToFileURL(path.join(root,file)));url.search=query;url.searchParams.set('odoo',major);
   await page.setViewportSize({width,height});await page.goto(url.href);await page.evaluate(()=>document.fonts.ready);
   let first;
   for(const time of times){
    await page.evaluate(t=>window.renderFrame(t),time);
    assert.ok(await page.evaluate(()=>[...document.querySelectorAll('[data-odoo-version]')].every(el=>el.textContent===new URLSearchParams(location.search).get('odoo'))));
    assert.ok(await page.evaluate(()=>document.fonts.check('700 30px "RivetFox Brand"')));
    assert.ok(await page.locator('.rf-lockup img').first().evaluate(img=>img.complete&&img.naturalWidth>0),'Publisher mark is decoded');
    const png=await page.screenshot();
    if(time===0)first=png;
    if(time===9&&!first.equals(png)){
     // Chrome can vary the final 8-bit rounding by one level across edges.
     // Ignore only that quantization noise; retain strict area and peak limits.
     // Decode pixels instead of requiring byte-identical PNG compression/rasterization.
     const rgb=buffer=>{
      const result=spawnSync('ffmpeg',['-v','error','-i','pipe:0','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],{input:buffer,maxBuffer:width*height*4});
      assert.equal(result.status,0,String(result.stderr));assert.equal(result.stdout.length,width*height*3);return result.stdout;
     };
     const a=rgb(first),b=rgb(png);let changed=0,maxDelta=0;
     for(let pixel=0;pixel<a.length;pixel+=3){
      const delta=Math.max(...[0,1,2].map(channel=>Math.abs(a[pixel+channel]-b[pixel+channel])));
      if(delta>1)changed++;maxDelta=Math.max(maxDelta,delta);
     }
     if(changed>width*height*.0001||maxDelta>8){
      await fs.writeFile(path.join(out,`${name}-loop-start.png`),first);await fs.writeFile(path.join(out,`${name}-loop-end.png`),png);
      assert.fail(`${name}: loop reset differs by ${changed} pixels, maximum channel delta ${maxDelta}`);
     }
    }
    if([0,3.9,4,6,6.9].includes(time))await fs.writeFile(path.join(out,`${name}-${time}.png`),png);
   }
  }
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:960});
   for(const name of ['listing','thumbnail']){
    await page.goto(pathToFileURL(path.join(root,'dist',`${name}-preview.html`)).href);
    await page.evaluate(()=>Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()})));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name}/${width}: overflow`);
    await page.screenshot({path:path.join(out,`${name}-${width}.png`)});
   }
  }
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[],'Promotional renderers must work entirely offline');
  console.log(`PASS Odoo ${major}: 4 GIFs fully decoded, dimensions/timing, every scene, visual loop reset, local publisher mark/font, desktop/mobile previews and no external requests`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
