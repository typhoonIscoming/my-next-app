'use client';

import * as React from 'react';
import {
    Controller,
    FormProvider,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
    type UseFormReturn,
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type FormFieldContextValue = {
    id: string;
    name?: string;
    error?: string | null;
    descriptionId?: string;
    errorId?: string;
    value?: unknown;
    onChange?: (value: unknown) => void;
    onBlur?: () => void;
    ref?: React.Ref<unknown>;
};

type FormControlChildProps = {
    id?: string;
    name?: string;
    value?: unknown;
    defaultValue?: unknown;
    onChange?: (value: unknown) => void;
    onBlur?: () => void;
    ref?: React.Ref<unknown>;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
    null
);

function useFormField() {
    const context = React.useContext(FormFieldContext);

    if (!context) {
        throw new Error('useFormField must be used within a FormField');
    }

    return context;
}

type FormProps<TFieldValues extends FieldValues> = Omit<
    React.ComponentProps<'form'>,
    'onSubmit'
> & {
    form: UseFormReturn<TFieldValues>;
    onSubmit: (data: TFieldValues) => void | Promise<void>;
};

function Form<TFieldValues extends FieldValues>({
    form,
    onSubmit,
    className,
    children,
    ...props
}: FormProps<TFieldValues>) {
    return (
        <FormProvider {...form}>
            <form
                data-slot="form"
                className={cn('flex w-full flex-col gap-4', className)}
                onSubmit={form.handleSubmit(onSubmit)}
                {...props}
            >
                {children}
            </form>
        </FormProvider>
    );
}

type FormFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'render'> & {
    children:
        React.ReactNode | ((field: FormFieldContextValue) => React.ReactNode);
    error?: string | null;
};

function FormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    children,
    name,
    control,
    error,
    ...props
}: FormFieldProps<TFieldValues, TName>) {
    const id = React.useId();
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;

    const baseField = React.useMemo<FormFieldContextValue>(
        () => ({
            id,
            name,
            error: error ?? null,
            descriptionId,
            errorId,
        }),
        [descriptionId, error, errorId, id, name]
    );

    return (
        <Controller
            control={control}
            name={name}
            {...props}
            render={({ field: controllerField, fieldState }) => {
                const fieldValue: FormFieldContextValue = {
                    ...baseField,
                    error: fieldState.error?.message ?? error ?? null,
                    value: controllerField.value,
                    onChange: controllerField.onChange,
                    onBlur: controllerField.onBlur,
                    ref: controllerField.ref,
                };

                return (
                    <FormFieldContext.Provider value={fieldValue}>
                        <div data-slot="form-field">
                            {typeof children === 'function'
                                ? children(fieldValue)
                                : children}
                        </div>
                    </FormFieldContext.Provider>
                );
            }}
        />
    );
}

type FormItemProps = React.ComponentProps<'div'>;

function FormItem({ className, ...props }: FormItemProps) {
    return (
        <div
            data-slot="form-item"
            className={cn('flex flex-col gap-2', className)}
            {...props}
        />
    );
}

type FormLabelProps = React.ComponentProps<typeof Label>;

function FormLabel({ className, ...props }: FormLabelProps) {
    const field = useFormField();

    return (
        <Label
            data-slot="form-label"
            className={cn('text-sm font-medium', className)}
            htmlFor={props.htmlFor ?? field.id}
            {...props}
        />
    );
}

type FormControlProps = React.ComponentProps<'div'> & {
    children: React.ReactElement<FormControlChildProps>;
};

function FormControl({ className, children, ...props }: FormControlProps) {
    const field = useFormField();

    if (!React.isValidElement<FormControlChildProps>(children)) {
        return null;
    }

    const childProps = children.props;
    const describedBy =
        [
            childProps['aria-describedby'],
            field.descriptionId,
            field.error ? field.errorId : undefined,
        ]
            .filter(Boolean)
            .join(' ') || undefined;

    const handleChange = (value: unknown) => {
        childProps.onChange?.(value as never);
        field.onChange?.(value as never);
    };

    const handleBlur = () => {
        childProps.onBlur?.();
        field.onBlur?.();
    };

    return (
        <div
            data-slot="form-control"
            className={cn('w-full', className)}
            {...props}
        >
            {React.cloneElement(children, {
                id: childProps.id ?? field.id,
                name: childProps.name ?? field.name,
                value: childProps.value ?? field.value,
                onChange: handleChange,
                onBlur: handleBlur,
                ref: childProps.ref ?? field.ref,
                'aria-invalid': childProps['aria-invalid'] ?? !!field.error,
                'aria-describedby': describedBy,
            })}
        </div>
    );
}

type FormDescriptionProps = React.ComponentProps<'p'>;

function FormDescription({ className, ...props }: FormDescriptionProps) {
    const field = useFormField();

    return (
        <p
            data-slot="form-description"
            id={field.descriptionId}
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

type FormMessageProps = React.ComponentProps<'p'> & {
    children?: React.ReactNode;
};

function FormMessage({ className, children, ...props }: FormMessageProps) {
    const field = useFormField();
    const content = children ?? field.error;

    if (!content) {
        return null;
    }

    return (
        <p
            data-slot="form-message"
            id={field.errorId}
            role="alert"
            className={cn('text-sm font-normal text-destructive', className)}
            {...props}
        >
            {content}
        </p>
    );
}

export {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    useFormField,
};
export type {
    FormFieldProps,
    FormItemProps,
    FormLabelProps,
    FormControlProps,
    FormDescriptionProps,
    FormMessageProps,
};
