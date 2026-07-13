// 📄 文件路径：__tests__/components/CommentForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommentForm from '@/components/CommentForm';
import userEvent from '@testing-library/user-event';

describe('CommentForm Component', () => {
    // 用例 1: 验证基本渲染
    // 目标：确保用户能看到输入框和按钮
    it('渲染输入框和按钮', () => {
        // 传入 mock 函数作为 props，防止真实调用
        render(<CommentForm onSubmit={jest.fn()} />);

        // 使用 getByPlaceholderText 和 getByRole 查询元素，这符合 RTL 的可访问性优先原则
        expect(
            screen.getByPlaceholderText('写下你的评论...')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: '发布评论' })
        ).toBeInTheDocument();
    });

    // 用例 2: 验证交互流程
    // 目标：模拟用户输入 -> 点击提交 -> 等待成功反馈
    it('用户提交评论后显示成功状态', async () => {
        // 创建一个模拟函数，并让它返回一个 Promise
        const mockSubmit = jest.fn().mockResolvedValue({});
        render(<CommentForm onSubmit={mockSubmit} />);

        // 1. 模拟用户输入
        const input = screen.getByLabelText('comment-input');
        fireEvent.change(input, { target: { value: '这是一条测试评论' } });

        // 2. 模拟点击提交
        const button = screen.getByRole('button', { name: '发布评论' });
        fireEvent.click(button);

        // 3. 验证中间状态（Loading）
        expect(screen.getByText('提交中...')).toBeInTheDocument();

        // 4. 等待异步操作完成并验证结果
        // waitFor 会轮询直到断言通过或超时
        await waitFor(() => {
            expect(screen.getByText('评论发布成功！')).toBeInTheDocument();
        });

        // 5. 确保 mock 函数被正确调用，验证参数传递是否正确
        expect(mockSubmit).toHaveBeenCalledWith('这是一条测试评论');
    });
});
