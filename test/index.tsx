import React, { ReactNode } from 'react';
import { ObservableModel, Binder, ModelProvider, ArrayProvider, ObservableArray } from '../src/index';
import { expect } from 'chai';
import { it, describe } from 'mocha';
import { mount } from 'enzyme';
import { IObservableArray, observable } from 'mobx';

describe('state_management', () => {
  describe('ObservableModel', () => {
    describe('Initial data', () => {
      const instance = new ObservableModel<number>(0);

      it('should set model to the value passed to the constructor', () => {
        expect(instance.value).to.equal(0);
      });
    });

    describe('get model, set model', () => {
      const instance = new ObservableModel<number>(0);

      it('should set model to the given value', () => {
        instance.value = 1;
        expect(instance.value).to.equal(1);
      });
    });

    describe('Listeners', () => {
      const instance = new ObservableModel<number>(0);

      let obj = {
        listener1WasCalled: false,
        listener2WasCalled: false,
      };

      const listener1 = (model: number) => {
        obj.listener1WasCalled = true;
      };

      const listener2 = (model: number) => {
        obj.listener2WasCalled = true;
      };
      it('should call unremoved listeners when model changes', () => {
        instance.addListener(listener1);
        instance.addListener(listener2);
        instance.value = 2;
        expect(obj.listener1WasCalled).to.be.true;
        expect(obj.listener2WasCalled).to.be.true;
      });

      it('should not call removed listeners when model changes', () => {
        obj.listener1WasCalled = false;
        obj.listener2WasCalled = false;
        instance.removeListener(listener1);
        instance.value = 3;
        expect(obj.listener1WasCalled).to.be.false;
        expect(obj.listener2WasCalled).to.be.true;
      });

      it('should call listeners with its latest value when model changes', () => {
        let obj = {
          listenerCalledWith: -1,
        };

        instance.addListener((value: number) => {
          obj.listenerCalledWith = value;
        });

        instance.value = 4;
        expect(instance.value).to.equal(obj.listenerCalledWith);
      });
    });
  });

  describe('ObservableArray', () => {
    describe('Initial data', () => {
      const instance = new ObservableArray<number>([1, 2, 3, 4]);

      it('should set the array elements to the elements passed to the constructor', () => {
        expect(instance.items).to.deep.equal([1, 2, 3, 4]);
      });
    });

    describe('Listeners', () => {
      const instance = new ObservableArray<number>([]);

      let obj = {
        listener1CalledWith: null,
        listener2CalledWith: null,
      };

      const listener1 = (items: IObservableArray<number>) => {
        (obj.listener1CalledWith as any) = items;
      };

      const listener2 = (items: IObservableArray<number>) => {
        (obj.listener2CalledWith as any) = items;
      };

      it('should call unremoved listeners with the latest items', () => {
        instance.addListener(listener1);
        instance.addListener(listener2);
        instance.items.push(2);
        expect(obj.listener1CalledWith as any).to.deep.equal([2]);
        expect(obj.listener2CalledWith as any).to.deep.equal([2]);
      });

      it('should NOT call removed listeners', () => {
        instance.removeListener(listener1);
        obj.listener1CalledWith = null;
        instance.items.push(3);
        expect(obj.listener1CalledWith).to.be.null;
        expect(obj.listener2CalledWith as any).to.deep.equal([2, 3]);
      });
    });
  });

  describe('Binder', () => {
    describe('bindingFor()', () => {
      it("should set the models' value to the current text of the input element when text is entered in the element", () => {
        let obj = {
          listenerCalledWith: '',
        };

        const observableModel = new ObservableModel<string>('');
        observableModel.addListener((model) => {
          obj.listenerCalledWith = model;
        });

        const inputElement = <input type="text" onChange={Binder.bindingFor(observableModel)} />;

        const wrapper = mount(inputElement).find('input');
        const text = 'helloWorld';
        wrapper.simulate('change', { target: { value: text } });
        expect(obj.listenerCalledWith).to.equal(text);
      });
    });
  });

  describe('ModelProvider', () => {
    describe('Rebuilding on value change', () => {
      let obj = {
        listenerCalledWith: -1,
      };

      const observableModel = new ObservableModel<number>(0);
      const element = (
        <ModelProvider<number>
          model={observableModel}
          render={(value: number): ReactNode => {
            obj.listenerCalledWith = value;
            return <h2>{value}</h2>;
          }}
        />
      );
      const wrapper = mount(element);

      it('should call the passed renderer with the latest value when the model changes', () => {
        // Poke the value at least twice to ensure stability
        observableModel.value = 1;
        observableModel.value = 2;

        expect(obj.listenerCalledWith).to.equal(2);
      });

      it('should render the component returned by the given renderer', () => {
        expect(wrapper.html()).to.equal('<h2>2</h2>');
      });
    });
  });

  describe('ArrayProvider', () => {
    describe('Rebuilding on items change', () => {
      let obj = {
        listenerCalledWith: observable.array<number>([]),
      };

      const observableArray = new ObservableArray<number>([0]);
      const element = (
        <ArrayProvider<number>
          model={observableArray}
          render={(items: IObservableArray<number>): ReactNode => {
            obj.listenerCalledWith = items;
            return <h2>{items.length}</h2>;
          }}
        />
      );
      const wrapper = mount(element);

      it('should call the passed renderer with the latest items when the model changes', () => {
        // Poke the items at least twice to ensure stability to ensure stability
        observableArray.items.push(2);
        observableArray.items.push(3);

        expect(obj.listenerCalledWith).to.deep.equal([0, 2, 3]);
      });

      it('should render the component returned by the given renderer', () => {
        expect(wrapper.html()).to.equal('<h2>3</h2>');
      });
    });
  });
});
