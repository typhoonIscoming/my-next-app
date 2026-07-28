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

console.log(curry(1, 2, 3)(4)(5, 6)(7, 8, 9).valueOf());

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
console.log(tree);
