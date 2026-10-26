export const phoneCountries = [
  {id:'eg',dial:'20',ar:'مصر',en:'Egypt',lengths:[9,10],example:'010 1234 5678'},
  {id:'sa',dial:'966',ar:'السعودية',en:'Saudi Arabia',lengths:[9],example:'05X XXX XXXX'},
  {id:'ae',dial:'971',ar:'الإمارات',en:'United Arab Emirates',lengths:[8,9],example:'05X XXX XXXX'},
  {id:'om',dial:'968',ar:'عُمان',en:'Oman',lengths:[8],example:'9XXX XXXX'},
  {id:'kw',dial:'965',ar:'الكويت',en:'Kuwait',lengths:[8],example:'5XXX XXXX'},
  {id:'qa',dial:'974',ar:'قطر',en:'Qatar',lengths:[8],example:'3XXX XXXX'},
  {id:'bh',dial:'973',ar:'البحرين',en:'Bahrain',lengths:[8],example:'3XXX XXXX'},
  {id:'jo',dial:'962',ar:'الأردن',en:'Jordan',lengths:[8,9],example:'07X XXX XXXX'},
  {id:'gb',dial:'44',ar:'المملكة المتحدة',en:'United Kingdom',lengths:[9,10],example:'07XXX XXXXXX'},
  {id:'us',dial:'1',ar:'الولايات المتحدة',en:'United States',lengths:[10],example:'202 555 0123'},
];
export const phoneDigits = (value:string) => value
  .replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  .replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
  .replace(/[\s().-]/g,'');

/** Recognise an explicitly international number when pasted or autofilled. */
export function splitInternationalPhone(value:string){
  const digits=phoneDigits(value).replace(/^00/,'+');
  if(!/^\+\d+$/.test(digits))return null;
  const country=phoneCountries.find(c=>digits.startsWith('+'+c.dial));
  return country?{country,number:digits.slice(country.dial.length+1)}:null;
}

/** Combine the selected code with a national number; never append a code twice. */
export function normalizeContactPhone(value:string,countryId:string){
  let country=phoneCountries.find(c=>c.id===countryId);
  if(!country)return null;
  let number=phoneDigits(value);
  if(number.startsWith('+')||number.startsWith('00')){
    const international=splitInternationalPhone(number);
    if(!international)return null;
    country=international.country;number=international.number;
  }
  if(country.id!=='us')number=number.replace(/^0/,'');
  if(!/^\d+$/.test(number)||!country.lengths.includes(number.length))return null;
  return '+'+country.dial+number;
}
