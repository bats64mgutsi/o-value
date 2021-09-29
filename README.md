# o-value

O-value is a reactive statement management solution for React apps that allows for granular control over which parts of your UI depend on which part of your viewmodels.

## Installing o-value

```bash
$ npm install --save o-value
# or
$ yarn add o-value
```

## Rebuilding when a model changes

```typescript
import { ObservableModel, ModelProvider } from "o-value";

const model = new ObservableModel<number>(0);

// The value of the model can be changed with the setter model.value
// e.g model.value = 5
hereIsTheModel(model);

// This component will always display the latest value of model.
return <ModelProvider<number> model={model} render={(value) => <h2>{value}</h2>} />;
```

## Rebuilding when an array is modified

```typescript
import { ObservableArray, ArrayProvider } from "o-value";

const model = new ObservableArray<number>([0, 2, 3]);

// The array value of an ObservableArray can be accessed with the getter model.value
hereIsTheArray(model);

// This component will always display display the latest number of items in the array.
return <ArrayProvider<number> model={model} render={(items) => <h2>{items.length}</h2>} />;
```

The value of an _ObservableArray_ implements the [mobx.IObservableArray](https://github.com/mobxjs/mobx/blob/main/packages/mobx/src/types/observablearray.ts) interface. The interface implements the following methods.

```typescript
spliceWithArray(index: number, deleteCount?: number, newItems?: T[]): T[]
clear(): T[]
replace(newItems: T[]): T[]
remove(value: T): boolean
toJSON(): T[]
```

## Binding text input to an _ObservableModel_

```typescript
import { ObservableModel, Binder } from "o-value";

const email = new ObservableModel<string>("");

const emailInput = (<input type="email" onChange={Binder.bindingFor(email)}/>);
```