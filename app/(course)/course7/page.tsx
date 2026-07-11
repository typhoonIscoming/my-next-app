import LikeButton from './components/LikeButton';

export default function Course7Page() {
    return (
        <main className="p-4">
            <h1 className="text-2xl font-bold mb-4">课程 7</h1>
            <LikeButton initialCount={0} />
            <p>
                服务器组件负责“取数与模板”，客户端组件负责“交互与副作用”。把不需要浏览器
                JS 的事情交给服务器做，页面更快、包更小、边界更清晰
            </p>
        </main>
    );
}
