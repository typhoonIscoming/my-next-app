# Typescript面试问题

## typescript中命名空间与模块的理解与区别

命名空间（Namespace）和模块（Module）都是用于组织和管理代码的方式，但它们有不同的使用场景和机制。

### 命名空间

- 命名空间是 TypeScript 提供的一种内部模块化机制，用于在全局范围内组织代码，避免命名冲突。
- 使用 `namespace` 关键字定义，内部可以包含接口、类、函数、变量等。
- 通过 `export` 导出成员，通过 `import` 或 `namespace.成员` 访问。
- 适用于在同一个全局作用域下组织大量相关代码的场景。

示例：

```typescript
namespace MyNamespace {
    export class MyClass {
        sayHello() {
            console.log('Hello');
        }
    }
}

const obj = new MyNamespace.MyClass();
obj.sayHello();
```

### 模块

- 模块是基于 ES6 模块规范的文件级别的代码组织方式，每个文件都是一个模块。
- 使用 `export` 导出成员，使用 `import` 导入其他模块的成员。
- 模块有自己的作用域，默认不会污染全局作用域。
- 适用于现代前端开发，尤其是配合打包工具（如 Webpack、Vite）使用。

示例：

```typescript
// foo.ts
export class MyClass {
    sayHello() {
        console.log('Hello');
    }
}

// main.ts
import { MyClass } from './foo';
const obj = new MyClass();
obj.sayHello();
```

### 区别总结

- 命名空间是 TypeScript 特有的，模块是 ES6 标准。
- 命名空间通过 `namespace` 定义，模块通过文件和 `export/import` 定义。
- 命名空间适合在全局范围内组织代码，模块适合文件级别的代码组织。
- 现代 TypeScript 项目更推荐使用模块而非命名空间。

## ts中 泛型的理解

泛型（Generics）是 TypeScript 提供的一种在保持类型安全的前提下，实现代码复用的机制。通过泛型，可以在定义函数、接口或类时，不预先指定具体的类型，而是在使用时再指定类型，从而实现灵活的类型约束。

### 示例

```typescript
// 泛型函数
function identity<T>(arg: T): T {
    return arg;
}

const str = identity<string>('hello'); // T 被指定为 string
const num = identity<number>(123);     // T 被指定为 number

// 泛型接口
interface Box<T> {
    value: T;
}

const box: Box<string> = { value: 'hello' };

// 泛型类
class Container<T> {
    private content: T;
    constructor(value: T) {
        this.content = value;
    }
    getContent(): T {
        return this.content;
    }
}

const container = new Container<number>(123);
console.log(container.getContent());
```

## ts中有哪些可以生命变量的方式

- 运行时变量声明：var、let、const
- 类型层面的声明：只存在于编译期。type、interface、enum、declare、namespace

## 使用ts实现一个判断入参是否是数组类型

```js
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// 泛型版本：收窄到具体元素类型
function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}
```

## any 与unknown的区别

any 和 unknown 都表示"任意类型"，但设计哲学完全相反：any 是关闭类型检查的逃生舱，unknown 是要求先验证再使用的安全容器。TypeScript 官方更推荐 unknown，因为它在保留灵活性的同时不牺牲类型安全。

### 示例

```typescript
let a: any;
let u: unknown;

a = 123;
a.toFixed(2); // 可以直接调用，不报错

u = 123;
// u.toFixed(2); // 报错，必须先进行类型检查
if (typeof u === 'number') {
    u.toFixed(2); // 安全使用
}
```
