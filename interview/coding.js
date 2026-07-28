async function timeout(delay) {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log('当前delay', delay);
			resolve();
		}, delay);
	});
}

class SuperTask {
	constructor({ poolSize }) {
		this.poolSize = poolSize;
		this.waiting = [];
		this.runningTaskCount = 0;
	}
	setPoolSize(size) {
		this.poolSize = size;
	}
	add(fn) {
		return new Promise((resolve) => {
			this.waiting.push({ fn, resolve });
			this.runTask();
		});
	}
	runTask() {
		while (
			this.runningTaskCount < this.poolSize &&
			this.waiting.length > 0
		) {
			const { fn, resolve } = this.waiting.shift();
			this.runningTaskCount++;
			fn().then(() => {
				resolve();
				this.runningTaskCount--;
				this.runTask();
			});
		}
	}
}

const superTask = new SuperTask({ poolSize: 2 });
function addTask(time, name) {
	const label = `任务${name}完成`;
	console.time(label);
	superTask
		.add(() => timeout(time))
		.then(() => {
			console.timeEnd(label);
		});
}

// addTask(10000, 1);
// addTask(1000, 2);
// addTask(5000, 3);
// addTask(7000, 4);
// addTask(4000, 5);

const curry = (...args) => {
	let params = args;
	const addFn = (...args2) => {
		params = params.concat(args2);
		return addFn;
	};

	addFn.valueOf = () => params.reduce((t, i) => t + i, 0);
	return addFn;
};

// console.log(curry(1, 2, 3)(4)(5, 6)(7, 8, 9).valueOf());

const list = [
	{ id: 'a2', label: '1', pid: 'a1' },
	{ id: 'a3', label: '2', pid: 'a17' },
	{ id: 'a1', label: '0', pid: 'root' },
	{ id: 'a4', label: '3', pid: 'a3' },
	{ id: 'a5', label: '5', pid: 'a4' },
	{ id: 'a6', label: '7', pid: 'a5' },
	{ id: 'a7', label: '8', pid: 'a5' },
	{ id: 'a8', label: '8', pid: 'a4' },
	{ id: 'a7', label: '9', pid: 'a6' },
	{ id: 'a9', label: '10', pid: 'a7' },
	{ id: 'a10', label: '11', pid: 'a9' },
	{ id: 'a11', label: '12', pid: 'a10' },
	{ id: 'a12', label: '13', pid: 'a10' },
	{ id: 'a13', label: '14', pid: 'a10' },
	{ id: 'a14', label: '15', pid: 'a11' },
	{ id: 'a15', label: '16', pid: 'a12' },
	{ id: 'a16', label: '17', pid: 'a13' },
	{ id: 'a17', label: '18', pid: 'a2' },
];

const buildTree = (node, tree) => {
	const child = tree.filter((item) => item.pid === node.id);
	if (child.length) {
		node.children = child.map((item) => buildTree(item, tree));
	}
	return node;
};

const tree = buildTree({ id: 'root', name: 'root', pid: null }, list);
// console.log(tree);

// 思路2：斐波那契数列
var numWays2 = function (n) {
	let a = 0;
	let b = 0;
	let result = 1;
	for (let i = 1; i <= n; ++i) {
		a = b;
		b = result;
		result = a + b;
	}
	return result;
};

// console.log(numWays2(4));

var lengthOfLongestSubstring = function (s) {
	let arr = [];
	let max = 0;
	for (let i = 0, len = s.length; i < len; ++i) {
		const sameIndex = arr.findIndex((item) => item === s[i]);
		arr.push(s[i]);
		if (sameIndex > -1) {
			arr = arr.splice(sameIndex + 1);
		}
		max = Math.max(arr.length, max);
	}
	return max;
};

var canPermutePalindrome = function (s) {
	const set = new Set();
	s.split('').forEach((key) => {
		console.log('===', key, set);
		if (set.has(key)) {
			set.delete(key);
		} else {
			set.add(key);
		}
		console.log('操作完后==', key, set);
	});
	return set.size <= 1;
};

console.log('回文', lengthOfLongestSubstring('ab111cdefedcba'));

function permute(arr) {
	const result = []; // ⽤于存储⽣成的全排列
	function backtrack(subarr, remaining) {
		// 如果没有剩余元素，当期排列就是⼀个全排列
		if (remaining.length === 0) {
			console.log('====', subarr);
			result.push(subarr.slice()); // 将当前排列添加到结果数组
		} else {
			for (let i = 0; i < remaining.length; i++) {
				subarr.push(remaining[i]); // 将当前元素添加到排列
				const newRemaining = [
					...remaining.slice(0, i),
					...remaining.slice(i + 1),
				]; // ⽣成新的剩余元素数组
				console.log('subarr, newRemaining', subarr, newRemaining);
				backtrack(subarr, newRemaining); // 递归⽣成剩余元素的排列
				subarr.pop(); // 回溯，移除刚添加的元素，以尝试其他排列⽅式
				console.log('回溯', subarr);
			}
		}
	}
	// 调⽤回溯函数开始⽣成全排列
	backtrack([], arr);
	return result; // 返回所有⽣成的全排列
}
const inputArray = [1, 2, 3];
const permutations = permute(inputArray);
console.log(permutations);
