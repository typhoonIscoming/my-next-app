'use server';

// 文件级声明：放在单独文件顶部，标记该文件所有导出为服务器函数

import { revalidateTag } from 'next/cache';

export async function addComment(formData: FormData) {
    console.log('addComment 被调用了，内容：', formData);
    // 用于 <form action={addComment}> 或客户端事件传入的 FormData
    // Server Action 接收 FormData（表单提交时自动注入），底层以 POST 方式调用
    const content = String(formData.get('content') || '');
    console.log('addComment 被调用了，内容：', content);
    if (!content.trim()) return;
    // 变更后精准刷新带有 'comments' 标签的数据
    revalidateTag('comments', 'max');
}
