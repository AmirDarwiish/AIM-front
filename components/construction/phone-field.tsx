'use client';
import {useId,useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {phoneCountries,splitInternationalPhone} from '@/lib/phone-number';
import type {Lang} from '@/lib/public-api';

export default function PhoneField({lang}:{lang:Lang}){
  const en=lang==='en',id=useId();
  const [countryId,setCountryId]=useState('eg'),[number,setNumber]=useState('');
  const country=phoneCountries.find(c=>c.id===countryId)!;
  return <div className="la-phone-field">
    <label htmlFor={id}>{en?'Phone number *':'رقم الهاتف *'}</label>
    <div className="la-phone-control" dir="ltr">
      <div className="la-phone-country">
        <img src={`/assets/flags/${country.id}.svg`} width="24" height="18" alt=""/>
        <span aria-hidden="true">+{country.dial}</span><ChevronDown size={14} aria-hidden="true"/>
        <select name="phoneCountry" aria-label={en?'Country and calling code':'الدولة وكود الاتصال'} value={countryId} onChange={e=>setCountryId(e.target.value)}>
          {phoneCountries.map(c=><option key={c.id} value={c.id}>{en?c.en:c.ar} (+{c.dial})</option>)}
        </select>
      </div>
      <input id={id} name="phone" type="tel" inputMode="tel" autoComplete="tel-national" required maxLength={30} placeholder={country.example} value={number} aria-describedby={`${id}-hint`} onChange={e=>{
        const value=e.target.value,international=splitInternationalPhone(value);
        if(international){setCountryId(international.country.id);setNumber(international.number)}else setNumber(value);
      }}/>
    </div>
    <small id={`${id}-hint`} className="la-form-hint">{en?'Choose your country, then enter your number.':'اختار الدولة واكتب رقمك، الكود جاهز.'}</small>
  </div>;
}
