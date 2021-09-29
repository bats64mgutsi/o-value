import { JSDOM } from 'jsdom';
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

configure({ adapter: new Adapter() });

// See: https://enzymejs.github.io/enzyme/docs/guides/jsdom.html
// And: https://enzymejs.github.io/enzyme/docs/installation/index.html

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src: any, target: any) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

global.window = window as any;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
} as any;
global.requestAnimationFrame = function (callback: any) {
  return setTimeout(callback, 0);
} as any;
global.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};
copyProps(window, global);
