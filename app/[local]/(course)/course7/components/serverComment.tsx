// app/comments/page.tsx（服务器组件，表单直连 Server Action）
import { addComment } from '@/actions/comments/action';

export default function CommentsPage() {
    return (
        // 表单直连 Server Action：即使 JS 未加载也能提交
        // 提交时会自动把输入项打包成 FormData 并传入 addComment
        <form action={addComment} className="p-8 flex gap-2">
            <input
                name="content"
                placeholder="输入评论"
                className="px-3 py-2 border rounded flex-1"
            />
            <button className="px-3 py-2 border rounded">提交</button>
        </form>
    );
}
