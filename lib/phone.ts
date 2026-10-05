export function latinDigits(value:string){return value.replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));}
export function internationalPhone(code:string,number:string){
 const dial=latinDigits(code).trim(),local=latinDigits(number).trim();
 if(!/^\+[1-9][0-9]{0,3}$/.test(dial)||! /^[0-9\s().-]+$/.test(local))return undefined;
 let digits=local.replace(/[\s().-]/g,'');
 // Remove the national trunk prefix only for these known numbering plans.
 if(['+20','+966','+964','+971','+962','+44','+33','+49'].includes(dial))digits=digits.replace(/^0/,'');
 const result=dial+digits;
 return digits.length>=6&&/^\+[1-9][0-9]{6,14}$/.test(result)?result:undefined;
}
