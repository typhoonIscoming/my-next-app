// 使用promise实现红绿灯交替重复完
const light = (color, duration) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log(color);
			resolve();
		}, duration);
	});
};

function trafficLight() {
	light('🔴 红灯', 3000)
		.then(() => light('🟢 绿灯', 3000))
		.then(() => light('🟡 黄灯', 2000))
		.then(() => trafficLight()); // 递归，实现无限循环
}

// trafficLight();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function trafficLight() {
	while (true) {
		console.log('🔴 红灯');
		await sleep(3000);
		console.log('🟢 绿灯');
		await sleep(3000);
		console.log('🟡 黄灯');
		await sleep(2000);
	}
}

// trafficLight();

// call/apply/bind的区别？自己实现一个bind
Function.prototype.myBind = function (context, ...bindArgs) {
	// 调用 bind 的必须是函数
	if (typeof this !== 'function') {
		throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
	}

	const fn = this;

	// 用 function 而非箭头函数，因为要能通过 new 调用并拿到自己的 this
	function boundFn(...callArgs) {
		// 判断是否通过 new 调用：new 时 this 的构造函数是 boundFn
		const isNew = this instanceof boundFn;
		// new 时忽略绑定的 context，用新实例；否则用传入的 context
		return fn.apply(isNew ? this : context, bindArgs.concat(callArgs));
	}

	// 处理原型链：new boundFn() 创建的实例应能访问 fn.prototype
	if (fn.prototype) {
		boundFn.prototype = Object.create(fn.prototype);
	}

	return boundFn;
};

// new 操作符具体干了什么
// 1. 创建一个新对象
// 2. 将新对象的原型指向构造函数的 prototype
// 3. 将构造函数的 this 指向新对象并执行构造函数
// 4. 如果构造函数返回对象，则返回该对象，否则返回新对象

// 创建新对象：创建一个空对象 obj。

// 设置原型链：把 obj.__proto__（即 [[Prototype]]）指向 Foo.prototype。

// 绑定 this 并执行：以 obj 作为 this 调用构造函数 Foo，传入 args。

// 处理返回值：

// 如果构造函数返回的是对象（包括函数、数组等引用类型），则 new 表达式的结果就是这个返回对象，obj 被丢弃；

// 如果返回的是原始值（或没写 return），则忽略返回值，结果仍是第 1 步创建的 obj。

// 大文件如何实现断点续传?
// 大文件断点续传的核心思路是分片上传 + 服务端记录已收分片 + 恢复时只补传缺失部分。纯前端无法独立完成断点续传，因为“服务器究竟收到了哪些分片”只有服务端知道，前端必须通过查询接口获取断点信息。

// . 文件分片
// 用 File.slice() 将大文件切成固定大小的块（常见 5MB 左右），每块带上索引和文件唯一标识。分片大小需要权衡：太小则请求过多、握手开销大；太大则单片失败重传成本高。

// 2. 生成文件唯一标识（fileHash）
// 用 SparkMD5 增量计算整个文件的哈希作为指纹。这个哈希有两个作用：一是用于秒传（服务端已有相同文件则直接跳过上传），二是作为断点续传时查询已上传分片的依据。分片本身用 fileHash-index 命名，确保乱序到达也能正确拼接。

// 3. 记录已上传分片
// 服务器收到分片后记录该分片已上传，通常存储在数据库或缓存中。

// 4. 查询断点信息
// 恢复上传时，前端先请求服务器，获取已上传的分片索引列表。

// 5. 补传缺失分片
// 前端根据断点信息，只上传缺失的分片，直至所有分片上传完成。

// 6. 全部完成后通知服务端合并
// 所有分片上传成功后，前端发送合并请求，服务端按索引顺序拼接分片，并可用整文件哈希做最终完整性校验。合并成功后清理本地 IndexedDB 记录，释放空间。

// 写一个函数将数字转换成汉字输出
const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const UNITS = ['', '十', '百', '千'];
// 每 4 位一节的节权：个、万、亿、兆
const SECTION_UNITS = ['', '万', '亿', '兆'];

/**
 * 将 0 ~ 9999 的四位数字转为汉字（不含节权）
 */
function sectionToChinese(num) {
	let str = '';
	let zero = false; // 标记是否出现过需要补“零”的 0

	for (let i = 3; i >= 0; i--) {
		const digit = Math.floor(num / 10 ** i) % 10;
		if (digit === 0) {
			// 只有前面已有非零数字、且后面还有非零数字时才需要补零
			if (str !== '') zero = true;
		} else {
			if (zero) {
				str += '零';
				zero = false;
			}
			str += DIGITS[digit] + UNITS[i];
		}
	}
	return str;
}

/**
 * 主函数：整数转汉字
 */
function numberToChinese(num) {
	if (!Number.isFinite(num)) throw new TypeError('请输入有效数字');

	// 负数
	let negative = false;
	if (num < 0) {
		negative = true;
		num = -num;
	}

	// 小数部分（可选支持）
	const [intPart, decPart] = String(num).split('.');

	if (Number(intPart) === 0) {
		// 整数部分为 0，如 0.5
		return negative ? '负零点' + [...decPart].map((d) => DIGITS[d]).join('') : '零';
	}

	// 整数部分按 4 位一节拆分（从低位到高位）
	const sections = [];
	let n = Number(intPart);
	while (n > 0) {
		sections.push(n % 10000);
		n = Math.floor(n / 10000);
	}

	let result = '';
	let needZero = false; // 高位节处理后，低位节是否需要在前面补零

	for (let i = sections.length - 1; i >= 0; i--) {
		const section = sections[i];
		if (section === 0) {
			// 整节为 0（如 100000000 中的“万”节），标记需要补零，但不立即补
			needZero = true;
			continue;
		}

		let sectionStr = sectionToChinese(section);

		if (needZero || (result !== '' && section < 1000)) {
			// 低位节不足 4 位（如 10001 的“0001”），需要补零
			// 但最高节本身不需要补
			if (result !== '') result += '零';
			needZero = false;
		}

		// “一十”开头读作“十”（仅在整个数字最高位且是十位时）
		if (i === sections.length - 1 && sectionStr.startsWith('一十')) {
			sectionStr = sectionStr.slice(1);
		}

		result += sectionStr + SECTION_UNITS[i];
	}

	// 去掉可能的多余“零”
	result = result.replace(/零+/g, '零').replace(/零$/, '');

	if (negative) result = '负' + result;

	// 处理小数
	if (decPart) {
		result += '点' + [...decPart].map((d) => DIGITS[d]).join('');
	}

	return result;
}

// console.log(numberToChinese(123456789));

// retryWithDelay
/**
 * 带重试的 fetch
 * @param {string} url
 * @param {RequestInit} options - fetch 配置
 * @param {object} retryOptions
 * @param {number} retryOptions.retries - 最大重试次数（不含首次），默认 3
 * @param {number} retryOptions.delay - 初始退避延迟 ms，默认 500
 * @param {number} retryOptions.factor - 退避倍数（指数退避），默认 2
 * @param {number} retryOptions.timeout - 单次请求超时 ms，默认 10000
 * @param {(res: Response) => boolean} retryOptions.shouldRetry - 判断响应是否应重试
 */
async function fetchWithRetry(url, options = {}, retryOptions = {}) {
	const {
		retries = 3,
		delay = 500,
		factor = 2,
		timeout = 1000,
		shouldRetry = (res) => res.status >= 500 || res.status === 429,
	} = retryOptions;

	let lastError;

	for (let attempt = 0; attempt < retries; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => {
			console.log(`Request timed out after ${timeout}ms`);
			controller.abort();
		}, timeout);

		try {
			// 合并外部传入的 signal 与超时 signal
			const signal = options.signal
				? AbortSignal.any([options.signal, controller.signal])
				: controller.signal;
			console.log(`Attempt ${attempt + 1} for ${url}`);
			const res = await fetch(url, { ...options, signal });

			clearTimeout(timer);

			if (!res.ok && shouldRetry(res)) {
				// 可重试的 HTTP 错误，抛出以便走重试逻辑
				const err = new Error(`HTTP ${res.status}`);
				err.response = res;
				throw err;
			}

			return res;
		} catch (err) {
			clearTimeout(timer);
			lastError = err;

			// 外部主动取消（非超时）不重试
			if (options.signal?.aborted) throw err;
			console.log('catch error on attempt', attempt + 1, err);
			// 最后一次尝试，不再等待
			if (attempt === retries - 1) break;

			// 指数退避 + 抖动，避免惊群
			const backoff = delay * factor ** attempt;
			const jitter = Math.random() * backoff * 0.1;
			await new Promise((r) => setTimeout(r, backoff + jitter));
		}
	}

	throw lastError;
}

// 自定义：最多重试 5 次，初始延迟 1s，超时 5s
const test = async () => {
	const res2 = await fetchWithRetry(
		'/api/slow',
		{},
		{
			retries: 3,
			delay: 1000,
			timeout: 5000,
			shouldRetry: (r) => r.status >= 500 || r.status === 408 || r.status === 429,
		}
	);
	console.log('res2', res2);
};
// test();

// 自己手动实现

const retry = async (fn, retryOptions = { retryTimes: 3 }) => {
	for (let i = 0; i < retryOptions.retryTimes; i++) {
		try {
			const res = await fn();
			console.log('res', res);
			return;
		} catch (e) {
			console.log('iii', i, retryOptions.retryTimes);
			if (i < retryOptions.retryTimes - 1) {
				const delay = 1000 * Math.pow(2, i);
				await new Promise((resolve) => setTimeout(resolve, delay));
			} else {
				break;
			}
		}
	}
};
let a = 0;
retry(async () => {
	const num = Math.random();
	console.log('====', a);
	a += 1;
	if (a > 2) return true;

	throw new Error('less than 0.5');
});
