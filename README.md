# throttle-listeners

---

## 说明

throttleListeners可以将多个监听器组合并监听一个新的组合值，同时可以对这个值做节流防抖操作，throttleListeners可以保证节流后的state前后两次不相同，避免不需要的state更新。

throttleListeners会在调用时执行一次stateUpdate，参数是listeners里传入的初始值。

## 参数

```tsx
type Listener<T> = {
    getDefaultValue: () => T, // 得到监听默认值
    addListener: (callback: (v: T) => void) => void, // 监听值变化
    removeListener: (callback: (v: T) => void) => void, // 取消监听
}
// 参数
listeners: Listener<any>[], // 监听器
getState: (...params) => T, // 将监听值组合成新的值（state）
stateUpdate: (state: T) => void, // state变化需要执行的操作
throttle: (stateUpdate: (state: T) => void) => (state: T) => void = (callback) => callback
// 对state的节流函数
```

## 返回值

`removeListeners = throttleListeners(...)`

执行`removeListeners`可以调用传递的所有`removeListener`解除监听

## 举例：

```jsx
// 自动检测当前在哪块区域
throttleListeners(
    [
        {
            getDefaultValue: () => window.scrollY, 
            addListener: (callback) => eventEmitter.on('scroll', callback), 
            removeListener: (callback) => eventEmitter.removeListener('scroll', callback)
        },
        {
            getDefaultValue: () => ({x: window.innerWidth, y: window.innerHeight}), 
            addListener: (callback) => eventEmitter.on('resize', callback), 
            removeListener: (callback) => eventEmitter.removeListener('resize', callback)
        },
    ],
    (scrollY, {y: windowHeight}) => {
        let descriptionRect = containers.description.getBoundingClientRect()
        let projectsRect = containers.projects.getBoundingClientRect()
        let professorsRect = containers.professors.getBoundingClientRect()
        let studentsRect = containers.students.getBoundingClientRect()
        let contactRect = containers.contact.getBoundingClientRect()
        if (windowHeight / 2 >= descriptionRect.top && windowHeight / 2 < descriptionRect.top + descriptionRect.height) {
            return 'description'
        } else if (windowHeight / 2 >= projectsRect.top && windowHeight / 2 < projectsRect.top + projectsRect.height) {
            return 'projects'
        } else if (windowHeight / 2 >= professorsRect.top && windowHeight / 2 < professorsRect.top + professorsRect.height) {
            return 'professors'
        } else if (windowHeight / 2 >= studentsRect.top && contactRect.top + contactRect.height * 2 / 3 > windowHeight) {
            return 'students'
        } else {
            return 'contact'
        }
    },
    (name) => {
        setTimeout(() => {
            for (let _name in navItems) {
                if (_name === name) {
                    navItems[_name].forEach(ele => {
                        ele.classList.add('active')
                    })
                } else {
                    navItems[_name].forEach(ele => {
                        ele.classList.remove('active')
                    })
                }
            }
        }, 0)
    },
    callback => debounce(200, false, callback)
)
```

这个函数实现的功能是：让导航栏中的栏目状态随着屏幕中间的内容块变化而变化。

监听scroll滚动变化和屏幕resize变化，这里的getState虽然没用到scrollY，但是getState里面的container rect位置大小都是scrollY的因变量，所以监听scroll变化还是非常必要的，getState的返回的是当前屏幕中心的内容块；

对新的state使用debounce（throttle-debounce）防抖，参考 [节流防抖](https://www.notion.so/54788eb1cd6343f4a37d75d411da6b11) 里的Debounce At End，使用这个在目前看来是最优解；(那种开始变化立即触发一次，结束变化再触发一次，已证明无用，它其实就是在这个的基础上加了一次开始变化立即触发一次，因为如果是连续变化，开始变化触发的那一次状态就没有必要，因为它还在快速的变化，如果不是连续变化，即变化一次，那立即触发和延时200ms区别也不大，因为你既然设置200ms，就应该能接受连续变化完最后响应速度是200ms，同样的单次变化响应速度也应该能接受）

节流之后的state更新会触发stateUpdate函数，从而更新导航栏中的栏目状态。