import assert from 'node:assert/strict';
import {galleryKeyStep,gallerySwipeStep} from '../lib/gallery-navigation.ts';
for(const lang of ['ar','en']){
 const nextKey=lang==='ar'?'ArrowLeft':'ArrowRight';
 const previousKey=lang==='ar'?'ArrowRight':'ArrowLeft';
 assert.equal(galleryKeyStep(nextKey,lang),1);
 assert.equal(galleryKeyStep(previousKey,lang),-1);
 assert.equal(galleryKeyStep('Escape',lang),0);
 assert.equal(gallerySwipeStep(lang==='ar'?90:-90,8,lang),1);
 assert.equal(gallerySwipeStep(lang==='ar'?-90:90,8,lang),-1);
 assert.equal(gallerySwipeStep(30,4,lang),0);
 assert.equal(gallerySwipeStep(80,120,lang),0);
}
console.log('PASS: physical left/right keyboard and swipe directions in Arabic/English; short taps and vertical scrolling do not change images.');
