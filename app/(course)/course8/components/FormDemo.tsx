'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const roleOptions = ['admin', 'editor', 'viewer'] as const;
const planOptions = ['free', 'pro', 'enterprise'] as const;

type FormValues = {
    username: string;
    email: string;
    role: string;
    plan: string;
    newsletter: boolean;
    agree: boolean;
    bio: string;
};

export function FormDemo() {
    const form = useForm<FormValues>({
        defaultValues: {
            username: '',
            email: '',
            role: 'editor',
            plan: 'pro',
            newsletter: true,
            agree: false,
            bio: '',
        },
    });

    const statusText = useMemo(() => {
        const values = form.getValues();
        return `当前值: ${JSON.stringify(values)}`;
    }, [form]);

    return (
        <div className="space-y-6 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Form 组件使用示例</h3>
                <p className="text-sm text-muted-foreground">
                    包含输入、选择、单选、复选框、说明文字和错误提示等常见场景。
                </p>
            </div>

            <Form
                form={form}
                onSubmit={(values) => console.log('submit', values)}
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="username"
                        rules={{ required: '用户名不能为空' }}
                    >
                        <FormItem>
                            <FormLabel>用户名</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入用户名" />
                            </FormControl>
                            <FormDescription>
                                用于显示你的昵称。
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField
                        control={form.control}
                        name="email"
                        rules={{
                            required: '邮箱不能为空',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: '请输入正确的邮箱格式',
                            },
                        }}
                    >
                        <FormItem>
                            <FormLabel>邮箱</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="请输入邮箱" />
                            </FormControl>
                            <FormDescription>
                                我们不会泄露你的邮箱。
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="role">
                        <FormItem>
                            <FormLabel>角色</FormLabel>
                            <FormControl>
                                <select className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none">
                                    {roleOptions.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormDescription>
                                控制你当前在系统中的权限级别。
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField control={form.control} name="plan">
                        <FormItem>
                            <FormLabel>套餐</FormLabel>
                            <FormControl>
                                <select className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none">
                                    {planOptions.map((plan) => (
                                        <option key={plan} value={plan}>
                                            {plan}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormDescription>
                                你可以随时切换套餐。
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="newsletter">
                        <FormItem>
                            <FormLabel>订阅邮件</FormLabel>
                            <FormControl>
                                <input type="checkbox" className="h-4 w-4" />
                            </FormControl>
                            <FormDescription>
                                接收产品更新和优惠消息。
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField control={form.control} name="agree">
                        <FormItem>
                            <FormLabel>同意服务条款</FormLabel>
                            <FormControl>
                                <input type="checkbox" className="h-4 w-4" />
                            </FormControl>
                            <FormDescription>
                                请确认你已阅读相关协议。
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <FormField
                    control={form.control}
                    name="bio"
                    rules={{ required: '简介不能为空' }}
                >
                    <FormItem>
                        <FormLabel>个人简介</FormLabel>
                        <FormControl>
                            <textarea
                                rows={4}
                                placeholder="请输入你的一段简介"
                                className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none"
                            />
                        </FormControl>
                        <FormDescription>
                            这个字段展示多行输入场景。
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                </FormField>

                <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
                    {statusText}
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button type="submit">提交</Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                    >
                        重置
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => form.setValue('username', 'demo-user')}
                    >
                        填充用户名
                    </Button>
                </div>
            </Form>
        </div>
    );
}
