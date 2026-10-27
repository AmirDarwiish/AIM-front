'use client';
import { Children, isValidElement, useId, type ReactNode } from 'react';
import { Select } from 'radix-ui';
import { Check, ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw } from 'lucide-react';
import s from './admin.module.css';

/** One keyboard-accessible select for filters and editor fields. */
export function AdminSelect({value,onValueChange,children,disabled=false,'aria-label':label}:{value:string|number;onValueChange:(value:string)=>void;children:ReactNode;disabled?:boolean;'aria-label':string}){
 const id=useId(),empty=`empty-${id}`;
 const options=Children.toArray(children).filter(isValidElement<{value:string|number;disabled?:boolean;children:ReactNode}>);
 return <Select.Root dir="rtl" value={String(value)===''?empty:String(value)} onValueChange={next=>onValueChange(next===empty?'':next)} disabled={disabled}>
  <Select.Trigger type="button" className={s.selectTrigger} aria-label={label}><Select.Value/><Select.Icon asChild><ChevronDown size={16}/></Select.Icon></Select.Trigger>
  <Select.Portal><Select.Content className={s.selectContent} position="popper" sideOffset={7} align="start" collisionPadding={12}>
   <Select.ScrollUpButton className={s.selectScroll}><ChevronUp size={16}/></Select.ScrollUpButton>
   <Select.Viewport className={s.selectViewport}>{options.map(option=><Select.Item className={s.selectOption} key={String(option.props.value)} value={String(option.props.value)===''?empty:String(option.props.value)} disabled={option.props.disabled}><Select.ItemText>{option.props.children}</Select.ItemText><Select.ItemIndicator className={s.selectCheck}><Check size={15}/></Select.ItemIndicator></Select.Item>)}</Select.Viewport>
   <Select.ScrollDownButton className={s.selectScroll}><ChevronDown size={16}/></Select.ScrollDownButton>
  </Select.Content></Select.Portal>
 </Select.Root>;
}
export function FilterSummary({total,active,onReset}:{total:number;active:boolean;onReset:()=>void}){return <div className={s.filterSummary}><span aria-live="polite"><SlidersHorizontal size={14}/><strong>{total.toLocaleString('ar-EG')}</strong> نتيجة{active&&<small>فلاتر مفعلة</small>}</span>{active&&<button type="button" onClick={onReset}><RotateCcw size={13}/>إعادة تعيين</button>}</div>;}
