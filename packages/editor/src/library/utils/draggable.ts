import {useEventListener} from 'ahooks';
import {useState} from 'react';

const DRAGGABLE_ELEMENT = 'draggable_element';
const DRAGGABLE_HANDLE = 'draggable_handle';

export function useRelativeDrag(): [
  typeof DRAGGABLE_ELEMENT,
  typeof DRAGGABLE_HANDLE,
] {
  const [moving, setMoving] = useState<
    {ele: HTMLElement; offset: {x: number; y: number}} | false
  >(false);

  useEventListener('mousedown', (e: MouseEvent): void => {
    let ele = e.target as HTMLElement;

    if (!ele.classList.contains(DRAGGABLE_HANDLE)) {
      return;
    }

    setMoving({ele, offset: {x: e.offsetX, y: e.offsetY}});
  });

  useEventListener('mousemove', (e: MouseEvent): void => {
    if (!moving) {
      return;
    }

    let {
      ele,
      offset: {x, y},
    } = moving;

    ele = ele.parentElement as any;

    let {scrollTop, scrollLeft} = document.documentElement;
    let {left, top} = ele.getBoundingClientRect();
    let {left: ol, top: ot} = getComputedStyle(ele);

    Object.assign<CSSStyleDeclaration, Partial<CSSStyleDeclaration>>(
      ele.style,
      {
        position: 'relative',
        left: `${e.clientX - x + scrollLeft - left + parseFloat(ol)}px`,
        top: `${e.clientY - y + scrollTop - top + parseFloat(ot)}px`,
      },
    );
  });

  useEventListener('mouseup', () => setMoving(false));

  return [DRAGGABLE_ELEMENT, DRAGGABLE_HANDLE];
}
