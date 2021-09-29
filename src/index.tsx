/**
 * Copyright (c) 2021 Batandwa Mgutsi
 *
 * This software is released under the MIT license. See LICENSE file for
 * more details.
 */

/* tslint:disable:max-classes-per-file */

import React, { ReactNode } from 'react';
import { observable, observe, IObservableArray, Lambda } from 'mobx';

export class ObservableModel<T> {
  private _value: T;
  private _listeners: ((value: T) => void)[] = [];

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value() {
    return this._value;
  }

  set value(instance: T) {
    this._value = instance;
    for (const listener of this._listeners) listener(this._value);
  }

  /**
   * Adds the given callback as a listener that will be called when the value of the model
   * changes changes.
   *
   * @param listener The listener to add.
   */
  addListener(listener: (value: T) => void) {
    this._listeners.push(listener);
  }

  /**
   * Removes the given listener.
   *
   * @param listener The listener to remove.
   */
  removeListener(listener: (value: T) => void): boolean {
    const index = this._listeners.indexOf(listener);
    if (index > -1) {
      this._listeners.splice(index, 1);
      return true;
    }
    return false;
  }
}

export class ObservableArray<T> {
  private _items: IObservableArray<T>;
  private _listenerDisposers: Map<(items: IObservableArray<T>) => void, Lambda> = new Map();

  constructor(items: T[]) {
    this._items = observable.array(items);
  }

  get items() {
    return this._items;
  }

  /**
   * Adds the given callback as a listener that will be called when the contents of the array
   * change.
   *
   * @param listener The listener to add.
   */
  addListener(listener: (items: IObservableArray<T>) => void) {
    const listenerDisposer = observe(this._items, (change) => {
      listener(change.object);
    });

    const currentDisposer = this._listenerDisposers.get(listener);
    if (currentDisposer) {
      // Clear the old disposer
      currentDisposer();
    }

    this._listenerDisposers.set(listener, listenerDisposer);
  }

  /**
   * Removes the given listener.
   *
   * @param listener The listener to remove.
   */
  removeListener(listener: (items: IObservableArray<T>) => void): boolean {
    const currentDisposer = this._listenerDisposers.get(listener);
    if (currentDisposer) {
      currentDisposer();
      return true;
    }

    return false;
  }
}

export type OnChangeListener = (e: React.ChangeEvent<HTMLInputElement>) => void;

/**
 * Utility methods for doing data binding.
 */
export class Binder {
  /**
   * Returns an input event listener that sets the value of `model` to the event value.
   *
   * The returned input listener should be used for text input elements only.
   *
   * @param model is the model to bind the input to.
   *
   * @example
   * const email = new ObservableModel<string>("");
   * const emailInput = (<input type="email" onChange={Binder.bindingFor(email)}/>);
   */
  static bindingFor(model: ObservableModel<string>): OnChangeListener {
    const listener = (e: React.ChangeEvent<HTMLInputElement>): void => {
      model.value = e.target.value;
    };

    return listener;
  }
}

type BaseModelProviderProps<T, S> = {
  model: ObservableModel<T> | ObservableArray<T>;
  render: (value: S) => ReactNode;
};

class BaseModelProvider<T, S> extends React.Component<BaseModelProviderProps<T, S>, { value: S }> {
  constructor(props: BaseModelProviderProps<T, S>) {
    super(props);
    this._model = props.model;
    this.state = {
      value: (this._model as any).value ?? (this._model as any).items,
    };
    this._modelListener = this._modelListener.bind(this);
  }

  componentDidMount() {
    this._model.addListener(this._modelListener);
  }

  componentWillUnmount() {
    this._model.removeListener(this._modelListener);
  }

  render(): ReactNode {
    const value = (this._model as any).value ?? (this._model as any).items;
    return this.props.render(value);
  }

  /**
   * Listener for the given model.
   */
  private _modelListener(_value: any) {
    this.setState({
      value: _value,
    });
  }

  private _model: ObservableModel<T> | ObservableArray<T>;
}

/**
 * Enables reactive programming by rebuilding everytime the value of the given model changes.
 *
 * Wrap all components that need to use the latest value of a model with this component.
 *
 * @example
 * const model = new ObservableModel<number>(0);
 * hereIsTheModel(model);
 *
 * // This component will always display the latest value of model.
 * return (
 *    <ModelProvider<number> model={model} render={value => (
 *      <h2>{value}</h2> )}
 *    />);
 */
export class ModelProvider<T> extends BaseModelProvider<T, T> {}

/**
 * Enables reactive programming by rebuilding everytime the items of the given array change.
 *
 * Wrap all components that need to use the latest items of an array with this component.
 *
 * @example
 * const model = new ObservableArray<number>([0, 2, 3]);
 * hereIsTheArray(model);
 *
 * // This component will always display display the latest number of items in the array.
 * return (
 *    <ArrayProvider<number> model={model} render={items => (
 *      <h2>{items.length}</h2> )}
 *    />);
 */
export class ArrayProvider<T> extends BaseModelProvider<T, IObservableArray<T>> {}
