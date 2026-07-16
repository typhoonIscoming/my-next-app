import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier'; // ← 新增

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	prettier,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
	]),
	{
		'@typescript-eslint/no-explicit-any': [0],
		semi: 'off',
		'@typescript-eslint/semi': 'off',
		// 可选：关闭其他可能与 Prettier 冲突的规则
		'comma-dangle': 'off',
		quotes: 'off',
	},
]);

export default eslintConfig;
