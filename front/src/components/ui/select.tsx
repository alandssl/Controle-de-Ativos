"use client"

import * as React from "react"

const Select = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
    <div className="relative">
        <select
            className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className}`}
            ref={ref}
            {...props}
        >
            {children}
        </select>
        <div className="absolute right-3 top-2.5 pointer-events-none opacity-50">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    </div>
))
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    >
        {children}
    </div>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 ${className}`}
        {...props}
    >
        <div className="p-1">{children}</div>
    </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
        {...props}
    >
        {children}
    </div>
))
SelectItem.displayName = "SelectItem"

const SelectValue = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        className={`block truncate ${className}`}
        {...props}
    />
))
SelectValue.displayName = "SelectValue"

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
