import { isIOS } from '@tencentcloud/universal-api';
const ua = navigator.userAgent;

function getScrollTypeByPlatform() {
  if (isIOS) {
    if (/Safari\//.test(ua) || /IOS 11_[0-3]\D/.test(ua)) {
      // Safari IOS 11.0-11.3 exclude（`scrollTop`/`scrolIntoView` not working）
      return 0;
    }
    // IOS: use `scrollTop`
    return 1;
  }
  // Android: use `scrollIntoView`
  return 2;
}

export default function riseInput(input: HTMLElement, target?: HTMLElement) {
  const scrollType = getScrollTypeByPlatform();
  let scrollTimer: ReturnType<typeof setTimeout>;

  if (!target) {
    // eslint-disable-next-line no-param-reassign
    target = input;
  }

  const scrollIntoView = () => {
    if (scrollType === 0) return;
    if (scrollType === 1) {
      document.body.scrollTop = document.body.scrollHeight;
    } else {
      target?.scrollIntoView(false);
    }
  };

  input.addEventListener('focus', () => {
    const timer = setTimeout(() => {
      scrollIntoView();
      clearTimeout(timer);
    }, 300);
    scrollTimer = setTimeout(scrollIntoView, 1000);
  });

  input.addEventListener('blur', () => {
    clearTimeout(scrollTimer);
    // Handle IOS issues about keyboard is hidden but page not refreshed
    if (scrollType && isIOS) {
      const timer = setTimeout(() => {
        document.body.scrollIntoView();
        clearTimeout(timer);
      });
    }
  });
}
