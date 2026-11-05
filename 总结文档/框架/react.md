# React相关面试题

- fiber架构工作原理？

React Fiber 架构的核心工作原理，是将原本不可中断的同步递归渲染，重构为可中断、可恢复、带优先级调度的增量渲染过程。

在 Fiber 之前（React 15 及更早），React 使用 Stack Reconciler。它依赖 JavaScript 自身的函数调用栈进行递归遍历组件树。这个过程是同步且一气呵成的，一旦开始就无法暂停。如果组件树很深或计算量大，JavaScript 会长时间占用浏览器主线程，导致布局、绘制以及用户输入响应被阻塞，造成掉帧和交互卡顿

Fiber 实现可中断能力的关键，在于用纯 JavaScript 对象（Fiber 节点） 构成的链表树，替代了原生的函数调用栈。
每个 Fiber 节点都包含组件的状态、子节点、兄弟节点以及指向父节点的引用。React 可以通过遍历这些 Fiber 节点，逐步完成渲染工作，并在必要时暂停和恢复，从而实现增量渲染和任务调度。

Fiber 架构还引入了优先级机制，不同的更新可以被赋予不同的优先级。React 会根据优先级调度任务，高优先级的任务可以打断低优先级的任务，从而保证用户交互的响应性。这种调度机制结合可中断的增量渲染，使得 React 在处理复杂组件树和大量更新时，能够保持流畅的用户体验。

## useState是如何实现的？

useState 是 React 提供的一个 Hook，用于在函数组件中管理状态。其实现依赖于 React 内部的 Hook 系统，核心思想是通过维护一个与组件对应的状态链表（或数组），在每次渲染时按顺序读取和更新状态。

每个函数组件在渲染时，会有一个对应的 Fiber 节点。这个 Fiber 节点上会保存一个指向该组件 Hook 链表的引用。每次调用 useState 时，React 会：

1. 检查当前 Hook 是否已经存在（通过链表顺序）。
2. 如果存在，返回当前状态值和更新函数。
3. 如果不存在，创建一个新的 Hook 节点，初始化状态，并将其加入链表。

当调用更新函数时，React 会将新的状态值存入对应的 Hook 节点，并触发该组件的重新渲染。在下一次渲染时，useState 会按照链表顺序返回最新的状态值，从而实现状态的持久化和更新。

存储位置：每个函数组件对应的 Fiber 节点上有一个 memoizedState 属性，它指向一个单向链表的头节点。

Hook 节点：组件中每调用一次 useState（或其他 Hook），就会在链表中创建一个对应的 Hook 对象。这个对象保存了该状态的当前值（memoizedState）以及一个更新队列（queue）。

顺序依赖：React 在渲染时，依靠 Hook 的调用顺序来依次匹配链表上的节点。这也是为什么 Hook 不能写在条件或循环语句中的根本原因——一旦顺序错乱，状态就会对应错误。

## 在react中如何给children添加额外的属性

在 React 中，可以通过 `React.cloneElement` 方法给子元素添加额外的属性。`React.cloneElement` 会克隆一个 React 元素，并在克隆的元素上合并新的 props。

示例：

```jsx
const Parent = ({ children }) => {
    return React.Children.map(children, child =>
        React.cloneElement(child, { extraProp: 'value' })
    );
};
```

## react是否支持给标签添加自定义属性？

自 React 16 起，你可以给 <div>、<video> 这类标准 HTML 或 SVG 元素传递任何未知属性（包括自定义属性），React 不再像旧版本那样忽略它们，而是会将其渲染到 DOM 上。

值会被序列化：如果你传递非字符串值（如对象、数组），React 会将其转换为字符串。例如 value={[1,2,3]} 会变成 value="1,2,3"。

命名约定：对于 React 已知的属性，仍需使用 React 的驼峰命名法（如 tabIndex、className），而不是 HTML 原生的全小写或连字符形式，否则开发环境会给出警告。

推荐使用 data-：虽然任意属性都能透传，但 React 官方建议，如果目的是在 DOM 上附加自定义数据，优先使用标准的 data-* 属性（如 data-foo="bar"），而不是随意命名的非标准属性。

## react中的路由懒加载是什么？原理是什么？

React 中的路由懒加载，指的是将不同路由对应的组件代码分割成独立的文件（chunk），只有当用户访问某个路由时，才动态加载该路由所需的代码。它的核心目的是减少应用初始加载的 JavaScript 体积，从而加快首屏显示速度。

原理：

1. 代码分割：通过动态 import 或 React.lazy，将路由组件拆分成独立的模块。
2. 懒加载：当路由匹配时，才触发对应模块的加载。
3. Suspense：React 提供 Suspense 组件，用于在异步组件加载期间显示加载状态，提升用户体验。

方式二：使用 React Router 内置的 lazy 属性（React Router v6.4+）
如果你使用的是较新版本的 React Router（数据路由模式），可以直接在路由配置中使用 lazy 属性。这个属性接收一个异步函数，返回一个包含 Component、loader 等属性的对象。

```jsx
// 路由配置
{
    path: "/projects",
    lazy: async () => {
        const { Component } = await import("./projects");
        return { Component };
    },
}
```

路由懒加载的底层原理可以拆解为两个层面：

1. 打包层面：代码分割（Code Splitting）
现代打包工具（如 Webpack、Vite）在构建时，会分析代码中的静态 import 和动态 import()。对于静态导入，它们会被合并进主 bundle；而当你使用 React.lazy(() => import('./Home')) 或路由的 lazy 函数时，打包工具会识别出这是一个动态导入，从而将 ./Home 及其依赖单独打包成一个独立的 chunk 文件，不放入主 bundle。这样，主包体积变小，初始加载更快。

2. 运行层面：按需加载与 Suspense 协调
当用户访问 /about 路由，React 开始渲染对应的懒加载组件时，会触发动态 import() 调用。浏览器向服务器请求之前分割出来的那个独立 chunk 文件。在文件下载并解析完成之前，React.lazy 返回的组件会“挂起”（suspend），这时外层的 Suspense 会捕获这个状态，并渲染 fallback 内容。一旦 chunk 加载完毕，Promise resolve，React 就会用真正的组件替换掉 fallback，完成渲染。

## react组件间通信方式

- 父子组件通信：Props 与回调
- 兄弟组件/共享状态：状态提升
- 跨组件通信：Context API
- 全局状态管理：Redux、MobX 等第三方库
- 其他方式（特定场景）
  - Refs：用于直接访问 DOM 节点或组件实例，通常不用于常规的数据流通信，而是处理焦点、媒体播放等命令式操作。

  - 事件总线：一种解耦的发布/订阅模式，适用于完全无嵌套关系的组件，但需要手动管理订阅生命周期，且随着应用扩大会增加维护成本。

## 说说对react闭包陷阱的理解，有哪些解决办法？

React 闭包陷阱（Stale Closure）指的是：组件函数每次渲染都会创建新的作用域，而某些回调或副作用函数捕获了某次渲染时的旧变量，导致执行时读到的是过期的值。

- 陷阱是如何产生的？
每一次渲染都有自己的 props、state 和事件处理函数。如果某个函数（如 setTimeout 回调、事件监听器、useEffect 中的逻辑）在创建时捕获了当次渲染的变量，而之后组件又渲染了多次，这个函数仍然引用着第一次创建时的旧值。

- 典型场景包括：

- useEffect 中使用了 state 但依赖数组为空：effect 只在挂载时执行一次，内部回调捕获的是首次渲染的 state，后续 state 更新不会反映到该回调中。
- setInterval / setTimeout 中读取 state：定时器回调在创建时捕获了当时的 state，之后 state 变化，回调读到的仍是旧值。
- 事件监听器未正确更新：在 useEffect 中注册的监听器如果依赖数组不完整，监听器内部引用的 state 会停留在注册时的快照。

- 解决办法：
  1. 确保 useEffect 的依赖数组完整，包含所有在 effect 中使用的 state 和 props。
  2. 对于定时器或事件监听器，可以在回调中使用最新的 state，例如通过 useRef 保存最新值，或者在回调中使用函数式更新。
  3. 对于需要稳定引用的回调函数，可以使用 useCallback 包裹，并确保依赖数组正确。

## react中有哪些优化性能的方式

- 使用 React.memo 包裹函数组件，避免不必要的重新渲染。
- 使用 useMemo 缓存计算结果，避免重复计算。
- 使用 useCallback 缓存函数引用，避免子组件因函数变化而重新渲染。
- 合理拆分组件，减少单个组件的渲染开销。
- 使用虚拟化列表（如 react-window、react-virtualized）处理长列表渲染。
- 避免匿名函数和对象字面量作为 props 传递，减少子组件不必要的更新。
- 使用 Suspense 和懒加载（React.lazy）按需加载组件，减少初始加载体积。
- 对于复杂的状态管理，考虑使用 Redux、MobX 等全局状态管理库，避免频繁的 prop drilling。

## react怎么实现状态自动保存（keepalive）

在 React 中，实现状态自动保存（类似 keepalive）的方式主要有以下几种：

- 使用 useState + localStorage/sessionStorage：在组件卸载前，将状态保存到本地存储，组件挂载时再读取恢复。
- 使用 useReducer + localStorage/sessionStorage：类似 useState，但适用于状态逻辑较复杂的场景。
- 使用 React Query 或 SWR：对于数据请求状态，这些库提供了缓存机制，可以在组件卸载后保留数据，重新挂载时直接读取缓存。
- 使用 keep-alive 组件库：社区有一些实现 keepalive 功能的库（如 react-activation），可以在组件切换时保持组件状态而不销毁。
- 使用全局状态管理：通过 Redux、MobX 等全局状态管理库，将状态提升到全局，组件卸载不会影响状态保存。

官方原生方案：React 19.2+ 的 <Activity> 组件
  该组件可以在组件切换时保持状态而不销毁，实现类似 keepalive 的效果。通过将需要保持状态的组件包裹在 <Activity> 内，当组件被卸载时，状态会被保留，重新挂载时可以恢复之前的状态。

社区主流方案（适用于 React 18 及更早版本）

- react-activation：一个社区实现的 keepalive 组件库，可以在组件切换时保持组件状态而不销毁，适用于 React 18 及更早版本。
- react-keep-alive：另一个社区实现的 keepalive 组件库，提供类似的功能，可以在组件切换时保持状态，适用于 React 18 及更早版本。

## 如何让useeffect支持async await

useEffect 本身不能直接使用 async 函数作为回调，因为 useEffect 期望回调函数返回 void 或一个清理函数，而 async 函数会返回一个 Promise。要在 useEffect 中使用 async/await，可以通过在回调内部定义一个异步函数并立即调用它：

```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      // 处理结果
    } catch (error) {
      // 处理错误
    }
  };

  fetchData();
}, []);
```

必须留意的问题：竞态与清理
仅仅把 async 函数挪到内部，并不能解决竞态条件。例如搜索框连续输入时，多个请求可能乱序返回，旧请求的结果可能覆盖新结果。

处理方式有两种：

用忽略标志阻止过期更新：在 effect 内维护一个 ignore 变量，清理函数将其置为 true，异步回调在写状态前先检查它。

用 AbortController 直接取消请求：在清理函数中调用 controller.abort()，请求会被真正中止，而不是在后台继续消耗带宽。注意捕获错误时忽略 AbortError，避免把主动取消当成真实失败。

其他可选方案

- 使用第三方数据请求库：如 React Query、SWR 等，这些库内置了请求缓存、去重和取消机制，可以有效避免竞态问题。
- 使用自定义 hook 封装异步逻辑：将异步请求和状态管理封装在自定义 hook 中，可以更方便地处理清理和竞态问题，保持组件逻辑简洁。
