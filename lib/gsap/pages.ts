import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const pageEnter = (scope: HTMLElement) => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
  tl.fromTo(
    scope.querySelectorAll('.enter-anim'),
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.08 }
  );
  return tl;
};

export const pageExit = (scope: HTMLElement, onComplete?: () => void) => {
  return gsap.to(scope.querySelectorAll('.exit-anim'), {
    y: -20, opacity: 0, duration: 0.35, ease: 'power2.in',
    onComplete,
  });
};
